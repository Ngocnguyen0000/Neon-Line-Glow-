import type { NeonOptions, ProcessResult } from '../types';
import { SVG_ELEMENTS_SELECTOR } from '../constants';

const uniqueId = (prefix = 'id') => {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
};

const computeScale = (svgElem: SVGSVGElement): number => {
  try {
    const viewBox = svgElem.getAttribute('viewBox');
    const widthAttr = svgElem.getAttribute('width');
    if (!viewBox) return 1;
    
    const parts = viewBox.split(/\s+|,/).filter(Boolean).map(Number);
    if (parts.length < 4) return 1;
    const vbWidth = parts[2];
    if (!vbWidth) return 1;
    
    if (!widthAttr) return 1;
    const widthPx = parseFloat(widthAttr);
    if (!isFinite(widthPx)) return 1;

    return widthPx / vbWidth;
  } catch (e) {
    console.error("Could not compute scale", e);
    return 1;
  }
};

const buildFilterElement = (id: string, options: NeonOptions, intensity: number, innerStdDev: number): SVGFilterElement => {
    const { color, inner, midColor, multiColor, opacity } = options;
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');

    const createFe = <K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', name);
        for (const [key, value] of Object.entries(attrs)) {
            el.setAttribute(key, value);
        }
        return el;
    };
    
    // Outer Glow
    filter.appendChild(createFe('feGaussianBlur', { 'in': 'SourceAlpha', stdDeviation: `${intensity}`, result: 'blurOuter' }));
    filter.appendChild(createFe('feFlood', { 'flood-color': color, 'flood-opacity': `${opacity}`, result: 'floodOuter' }));
    filter.appendChild(createFe('feComposite', { 'in': 'floodOuter', in2: 'blurOuter', operator: 'in', result: 'coloredHaloOuter' }));

    const merge = createFe('feMerge', {});
    merge.appendChild(createFe('feMergeNode', { 'in': 'coloredHaloOuter' }));

    // Mid Glow (if multi-color is enabled)
    if (multiColor) {
        const midIntensity = intensity * 0.6; // Tighter glow
        filter.appendChild(createFe('feGaussianBlur', { 'in': 'SourceAlpha', stdDeviation: `${midIntensity}`, result: 'blurMid' }));
        filter.appendChild(createFe('feFlood', { 'flood-color': midColor, 'flood-opacity': `${opacity}`, result: 'floodMid' }));
        filter.appendChild(createFe('feComposite', { 'in': 'floodMid', in2: 'blurMid', operator: 'in', result: 'coloredHaloMid' }));
        merge.appendChild(createFe('feMergeNode', { 'in': 'coloredHaloMid' }));
    }

    // Inner Core
    filter.appendChild(createFe('feGaussianBlur', { 'in': 'SourceAlpha', stdDeviation: `${innerStdDev}`, result: 'blurInner' }));
    filter.appendChild(createFe('feFlood', { 'flood-color': inner, 'flood-opacity': `${Math.min(1, opacity + 0.1)}`, result: 'floodInner' }));
    filter.appendChild(createFe('feComposite', { 'in': 'floodInner', in2: 'blurInner', operator: 'in', result: 'innerCore' }));
    merge.appendChild(createFe('feMergeNode', { 'in': 'innerCore' }));

    // Source Graphic on top
    merge.appendChild(createFe('feMergeNode', { 'in': 'SourceGraphic' }));
    filter.appendChild(merge);

    return filter;
};


const cloneAndApply = (elem: SVGElement, filterId: string, options: NeonOptions): SVGElement => {
    const clone = elem.cloneNode(true) as SVGElement;
    
    const origStrokeWidthAttr = elem.getAttribute('stroke-width');
    let baseStrokeWidth = 0;
    if (origStrokeWidthAttr) {
        const num = parseFloat(origStrokeWidthAttr);
        if (isFinite(num)) baseStrokeWidth = num;
    }

    const hasStroke = elem.getAttribute('stroke') && elem.getAttribute('stroke') !== 'none';
    const hasFill = elem.getAttribute('fill') && elem.getAttribute('fill') !== 'none';

    if (!hasStroke && hasFill) {
        clone.setAttribute('fill', 'none');
        clone.setAttribute('stroke', options.color);
        clone.setAttribute('stroke-width', `${(baseStrokeWidth || 1) + options.width}`);
    } else {
        clone.setAttribute('stroke', options.color);
        clone.setAttribute('stroke-width', `${(baseStrokeWidth || 1) + options.width}`);
        if (!hasFill) clone.setAttribute('fill', 'none');
    }
    
    if (!options.preserveFill) {
        elem.setAttribute('fill', 'none');
    }

    const style = clone.getAttribute('style') || '';
    clone.setAttribute('style', `${style};opacity:${options.opacity}`);
    clone.setAttribute('filter', `url(#${filterId})`);
    clone.setAttribute('data-neon-clone', 'true');

    elem.parentElement?.insertBefore(clone, elem);

    return clone;
};

export const processSvg = (svgText: string, options: NeonOptions): ProcessResult => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    
    const svgParseError = doc.querySelector('parsererror');
    if (svgParseError) {
        throw new Error(`Invalid SVG file: ${svgParseError.textContent || 'Unknown parsing error'}`);
    }

    const svg = doc.querySelector('svg');
    if (!svg) throw new Error('No <svg> root element found.');
    
    // Clean up previous processing artifacts if any
    doc.querySelectorAll('[data-neon-clone], [data-neon-filter], [data-neon-processed]').forEach(el => el.remove());
    svg.querySelectorAll(SVG_ELEMENTS_SELECTOR).forEach(el => {
        el.removeAttribute('data-neon-processed');
        if (el.getAttribute('style')?.includes('opacity:')) {
            el.setAttribute('style', el.getAttribute('style')?.replace(/opacity:\s*\d*\.?\d*;/g, '') || '');
        }
    });


    const warnings: string[] = [];
    if (doc.querySelectorAll('image').length > 0) {
        warnings.push(`Found <image> element(s). Raster images will not be neonified.`);
    }
    if (doc.querySelectorAll('style, link[rel="stylesheet"]').length > 0) {
        warnings.push('SVG contains <style> or <link> tags. External or complex CSS may not be fully supported.');
    }

    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.prepend(defs);
    }
    
    const scaleFactor = options.scaleAware ? computeScale(svg) : 1;
    const filterId = uniqueId('neon-glow');
    const scaledIntensity = options.intensity * scaleFactor;
    const scaledInnerStdDev = Math.max(1, Math.round(options.intensity * 0.25)) * scaleFactor;

    const filterEl = buildFilterElement(filterId, options, scaledIntensity, scaledInnerStdDev);
    filterEl.setAttribute('data-neon-filter', 'true');
    defs.appendChild(filterEl);

    const elements = Array.from(svg.querySelectorAll(SVG_ELEMENTS_SELECTOR)) as SVGElement[];

    elements.forEach((el) => {
        if (el.closest('defs') || el.getAttribute('data-neon-processed') === 'true') {
            return;
        }
        el.setAttribute('data-neon-processed', 'true');
        cloneAndApply(el, filterId, options);
    });
    
    const serializer = new XMLSerializer();
    const finalSvg = serializer.serializeToString(svg);

    return { svg: finalSvg, warnings };
};
