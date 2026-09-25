import React from "react";

const paletteDark = {
  foreground: "#E4E4E4EB", foregroundSecondary: "#E4E4E48D", foregroundTertiary: "#E4E4E45E", foregroundQuaternary: "#E4E4E442",
  editor: "#181818", chrome: "#141414", sidebar: "#141414", elevated: "#1E1E1E",
  fillPrimary: "#E4E4E430", fillSecondary: "#E4E4E41E", fillTertiary: "#E4E4E411", fillQuaternary: "#E4E4E40A",
  strokePrimary: "#E4E4E433", strokeSecondary: "#E4E4E41F", strokeTertiary: "#E4E4E414", strokeFocused: "#E4E4E4",
  accent: "#599CE7", buttonBackground: "#599CE7", buttonForeground: "#191c22", buttonHoverBackground: "#6AABE9", link: "#87c3ff",
  diffInsertedLine: "#3FA26633", diffRemovedLine: "#B8004933", diffStripAdded: "#3FA2668F", diffStripRemoved: "#FC6B838F"
};

const paletteLight = {
  foreground: "#141414F0", foregroundSecondary: "#141414BD", foregroundTertiary: "#1414148A", foregroundQuaternary: "#1414145C",
  editor: "#FCFCFC", chrome: "#F3F3F3", sidebar: "#F3F3F3", elevated: "#FFFFFF",
  fillPrimary: "#14141433", fillSecondary: "#14141424", fillTertiary: "#14141414", fillQuaternary: "#1414140F",
  strokePrimary: "#14141433", strokeSecondary: "#1414141F", strokeTertiary: "#14141414", strokeFocused: "#3685BF",
  accent: "#3685BF", buttonBackground: "#3685BF", buttonForeground: "#FCFCFC", buttonHoverBackground: "#2E76AB", link: "#3685BF",
  diffInsertedLine: "#1F8A651F", diffRemovedLine: "#CF2D5614", diffStripAdded: "#1F8A65CC", diffStripRemoved: "#CF2D56CC"
};

export const categoryPaletteDark = { gray: "#E4E4E48A", purple: "#9386F2", green: "#3FA266", yellow: "#F1B467", cyan: "#81A1C1", pink: "#B48EAD", blue: "#7BAFE9", orange: "#DD7F76", red: "#FC6B83" };
export const categoryPaletteLight = { gray: "#1414148A", purple: "#7754D9", green: "#1F8A65", yellow: "#C08532", cyan: "#4C7F8C", pink: "#B8448B", blue: "#3685BF", orange: "#D75C4E", red: "#CF2D56" };
export const colorPalette = categoryPaletteDark;
export const usageColorSequence = ["gray", "purple", "green", "yellow", "cyan", "pink", "blue", "orange", "red"] as const;
const chartColors = ["#2E79B5", "#1F8A65", "#7B64B8", "#C85898", "#F0A040", "#2A9A8A", "#C04848", "#70B0D8"];

function buildTokens(palette: typeof paletteDark, category: typeof categoryPaletteDark) {
  return {
    bg: { editor: palette.editor, chrome: palette.chrome, elevated: palette.elevated },
    text: { primary: palette.foreground, secondary: palette.foregroundSecondary, tertiary: palette.foregroundTertiary, quaternary: palette.foregroundQuaternary, link: palette.link, onAccent: palette.buttonForeground },
    stroke: { primary: palette.strokePrimary, secondary: palette.strokeSecondary, tertiary: palette.strokeTertiary, focused: palette.strokeFocused },
    fill: { primary: palette.fillPrimary, secondary: palette.fillSecondary, tertiary: palette.fillTertiary, quaternary: palette.fillQuaternary },
    accent: { primary: palette.accent, control: palette.buttonBackground, controlHover: palette.buttonHoverBackground },
    diff: { insertedLine: palette.diffInsertedLine, removedLine: palette.diffRemovedLine, stripAdded: palette.diffStripAdded, stripRemoved: palette.diffStripRemoved },
    category
  };
}

export const canvasTokens = buildTokens(paletteDark, categoryPaletteDark);
export const canvasTokensLight = buildTokens(paletteLight as typeof paletteDark, categoryPaletteLight as typeof categoryPaletteDark);
export const canvasPaletteDark = paletteDark;
export const canvasPaletteLight = paletteLight;
export const canvasTypography = {
  h1: { fontSize: "24px", lineHeight: "30px", fontWeight: 590 },
  h2: { fontSize: "18px", lineHeight: "24px", fontWeight: 590 },
  h3: { fontSize: "16px", lineHeight: "22px", fontWeight: 590 },
  body: { fontSize: "14px", lineHeight: "20px", fontWeight: 400 },
  small: { fontSize: "12px", lineHeight: "16px", fontWeight: 400 }
};
export const canvasSpacing = { "0.5": 2, "1": 4, "1.5": 6, "2": 8, "2.5": 10, "3": 12, "3.5": 14, "4": 16, "4.5": 18, "5": 20, "6": 24, "7": 28, "8": 32, "9": 36, "10": 40 };
export const canvasRadius = { none: 0, xs: 2, sm: 4, md: 6, lg: 8, xl: 12, full: 9999 };

function currentTheme() {
  const light = document.documentElement.dataset.theme === "light";
  const palette = light ? paletteLight : paletteDark;
  const tokens = light ? canvasTokensLight : canvasTokens;
  return { kind: light ? "light" : "dark", ...tokens, tokens, palette };
}

export function useHostTheme() {
  const [theme, setTheme] = React.useState(currentTheme);
  React.useEffect(() => {
    const update = () => setTheme(currentTheme());
    window.addEventListener("canvas-theme-change", update);
    return () => window.removeEventListener("canvas-theme-change", update);
  }, []);
  return theme;
}

export function useCanvasState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storageKey = `codex-canvas-preview:${location.pathname}:${key}`;
  const [value, setValue] = React.useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === null ? defaultValue : JSON.parse(stored);
    } catch { return defaultValue; }
  });
  const setPersistentValue = React.useCallback((action: React.SetStateAction<T>) => {
    setValue((previous) => {
      const next = typeof action === "function" ? (action as (value: T) => T)(previous) : action;
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* best effort */ }
      return next;
    });
  }, [storageKey]);
  return [value, setPersistentValue];
}

export function useCanvasAction() {
  return React.useCallback((action: any) => {
    console.info("Canvas host action is unavailable in browser preview", action);
    window.alert(`Canvas host action “${action?.type ?? "unknown"}” is only available inside Cursor.`);
  }, []);
}

export function mergeStyle(base: React.CSSProperties, override?: React.CSSProperties) { return { ...base, ...(override ?? {}) }; }

export function Stack({ children, gap = 12, style }: any) { return <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>; }
export function Row({ children, gap = 8, align = "center", justify = "start", wrap = false, style }: any) {
  const justifyContent = justify === "space-between" ? "space-between" : `flex-${justify}`;
  const alignItems = align === "stretch" ? "stretch" : `flex-${align}`;
  return <div style={{ display: "flex", gap, alignItems, justifyContent, flexWrap: wrap ? "wrap" : "nowrap", ...style }}>{children}</div>;
}
export function Grid({ children, columns, gap = 12, align = "stretch", style }: any) {
  return <div className={`canvas-grid ${typeof columns === "number" ? "canvas-grid-numeric" : "canvas-grid-custom"}`} style={{ display: "grid", gridTemplateColumns: typeof columns === "number" ? `repeat(${columns}, minmax(0, 1fr))` : columns, gap, alignItems: align, ...style }}>{children}</div>;
}
export function Divider({ style }: any) { const t = useHostTheme(); return <div role="separator" style={{ height: 1, background: t.stroke.tertiary, ...style }} />; }
export function Spacer() { return <div style={{ flex: 1 }} />; }

function toneColor(t: any, tone?: string) {
  return tone === "success" ? t.category.green : tone === "danger" ? t.category.red : tone === "warning" ? t.category.yellow : tone === "info" ? t.category.blue : t.text.primary;
}

const TextContext = React.createContext(false);
export function Text({ children, tone = "primary", size = "body", as, weight = "normal", italic = false, truncate, style }: any) {
  const t = useHostTheme();
  const nested = React.useContext(TextContext);
  const Tag = as ?? (nested ? "span" : "p");
  const weights: any = { normal: 400, medium: 500, semibold: 600, bold: 700 };
  return <TextContext.Provider value={true}><Tag style={{ margin: 0, color: t.text[tone] ?? t.text.primary, fontSize: size === "small" ? 12 : 14, lineHeight: size === "small" ? "16px" : "20px", fontWeight: weights[weight], fontStyle: italic ? "italic" : undefined, overflow: truncate ? "hidden" : undefined, textOverflow: truncate ? "ellipsis" : undefined, whiteSpace: truncate ? "nowrap" : undefined, direction: truncate === "start" ? "rtl" : undefined, ...style }}>{children}</Tag></TextContext.Provider>;
}
export function H1({ children, style }: any) { const t = useHostTheme(); return <h1 style={{ ...canvasTypography.h1, margin: 0, color: t.text.primary, ...style }}>{children}</h1>; }
export function H2({ children, style }: any) { const t = useHostTheme(); return <h2 style={{ ...canvasTypography.h2, margin: 0, color: t.text.primary, ...style }}>{children}</h2>; }
export function H3({ children, style }: any) { const t = useHostTheme(); return <h3 style={{ ...canvasTypography.h3, margin: 0, color: t.text.primary, ...style }}>{children}</h3>; }
export function Code({ children, style }: any) { const t = useHostTheme(); return <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: ".92em", borderRadius: 4, padding: "1px 4px", background: t.fill.tertiary, color: t.text.primary, ...style }}>{children}</code>; }
export function Link({ children, href, style }: any) { const t = useHostTheme(); return <a href={href} target="_blank" rel="noreferrer" style={{ color: t.text.link, textDecoration: "none", ...style }}>{children}</a>; }

const CardContext = React.createContext<any>(null);
export function Card({ children, variant = "default", size = "base", stickyHeader = false, collapsible = false, defaultOpen = true, open: controlledOpen, onOpenChange, style }: any) {
  const t = useHostTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => { if (controlledOpen === undefined) setUncontrolledOpen(next); onOpenChange?.(next); };
  return <CardContext.Provider value={{ size, stickyHeader, collapsible, open, setOpen }}><section style={{ background: t.bg.elevated, border: variant === "borderless" ? "none" : `1px solid ${t.stroke.secondary}`, borderRadius: variant === "borderless" ? 0 : 8, overflow: "hidden", minWidth: 0, ...style }}>{children}</section></CardContext.Provider>;
}
export function CardHeader({ children, trailing, style }: any) {
  const t = useHostTheme(); const context = React.useContext(CardContext);
  const content = <><span style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>{context?.collapsible && <span aria-hidden style={{ display: "inline-block", transform: context.open ? "rotate(90deg)" : undefined, transition: "transform .15s" }}>›</span>}<span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span></span>{trailing && <span style={{ marginLeft: "auto" }}>{trailing}</span>}</>;
  const baseStyle: React.CSSProperties = { minHeight: context?.size === "lg" ? 36 : 30, display: "flex", alignItems: "center", gap: 8, padding: context?.size === "lg" ? "0 14px" : "0 12px", borderBottom: context?.open === false ? "none" : `1px solid ${t.stroke.tertiary}`, background: t.bg.chrome, color: t.text.secondary, fontSize: 12, fontWeight: 600, position: context?.stickyHeader ? "sticky" : undefined, top: context?.stickyHeader ? 0 : undefined, zIndex: 1, ...style };
  if (context?.collapsible) return <button type="button" onClick={() => context.setOpen(!context.open)} style={{ ...baseStyle, width: "100%", borderLeft: 0, borderRight: 0, borderTop: 0, cursor: "pointer", textAlign: "left" }}>{content}</button>;
  return <header style={baseStyle}>{content}</header>;
}
export function CardBody({ children, style }: any) { const context = React.useContext(CardContext); if (context?.collapsible && !context.open) return null; return <div style={{ padding: context?.size === "lg" ? 16 : 12, ...style }}>{children}</div>; }

export function Button({ children, variant = "secondary", disabled, type = "button", style, onClick }: any) {
  const t = useHostTheme(); const primary = variant === "primary";
  return <button type={type} disabled={disabled} onClick={onClick} style={{ minHeight: 26, width: "fit-content", padding: "3px 9px", borderRadius: 5, border: variant === "ghost" ? "1px solid transparent" : `1px solid ${primary ? t.accent.control : t.stroke.primary}`, background: primary ? t.accent.control : variant === "ghost" ? "transparent" : t.fill.tertiary, color: primary ? t.text.onAccent : t.text.primary, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1, ...style }}>{children}</button>;
}
export function Pill({ children, active = false, size = "md", leadingContent, keyboardHint, disabled, title, style, onClick }: any) {
  const t = useHostTheme(); const Tag: any = onClick ? "button" : "span";
  return <Tag type={onClick ? "button" : undefined} title={title} disabled={disabled} onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 5, width: "fit-content", minHeight: size === "sm" ? 18 : 24, padding: size === "sm" ? "1px 6px" : "2px 9px", borderRadius: 999, border: size === "sm" ? "none" : `1px solid ${active ? t.stroke.primary : t.stroke.secondary}`, background: active ? t.fill.primary : t.fill.quaternary, color: active ? t.text.primary : t.text.secondary, fontSize: size === "sm" ? 10 : 12, cursor: onClick && !disabled ? "pointer" : "default", opacity: disabled ? .5 : 1, ...style }}>{leadingContent}{children}{keyboardHint && <span style={{ color: t.text.tertiary }}>{keyboardHint}</span>}</Tag>;
}
export function Stat({ value, label, tone, style }: any) { const t = useHostTheme(); return <div style={{ minWidth: 0, padding: "10px 0", ...style }}><div style={{ color: toneColor(t, tone), fontSize: 24, lineHeight: "30px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</div><div style={{ color: t.text.secondary, fontSize: 12, lineHeight: "16px", marginTop: 3 }}>{label}</div></div>; }
export function Callout({ children, tone = "neutral", title, icon, style }: any) { const t = useHostTheme(); const color = toneColor(t, tone); return <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 9, padding: "10px 12px", background: t.fill.tertiary, borderLeft: `3px solid ${color}`, borderRadius: 4, color: t.text.primary, ...style }}><span aria-hidden style={{ color, lineHeight: "20px" }}>{icon ?? (tone === "success" ? "✓" : tone === "warning" ? "!" : tone === "danger" ? "×" : tone === "info" ? "i" : "•")}</span><div>{title && <div style={{ fontSize: 13, lineHeight: "19px", fontWeight: 600, marginBottom: children ? 3 : 0 }}>{title}</div>}<div style={{ fontSize: 13, lineHeight: "19px", color: t.text.secondary }}>{children}</div></div></div>; }

export function Table({ headers, rows, columnAlign = [], rowTone = [], framed = true, striped = false, stickyHeader = false, style, emptyMessage }: any) {
  const t = useHostTheme();
  return <div style={{ overflow: "auto", border: framed ? `1px solid ${t.stroke.secondary}` : undefined, borderRadius: framed ? 7 : undefined, ...style }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, lineHeight: "17px" }}><thead><tr>{headers.map((header: any, index: number) => <th key={index} style={{ position: stickyHeader ? "sticky" : undefined, top: stickyHeader ? 0 : undefined, zIndex: 1, padding: "8px 10px", textAlign: columnAlign[index] ?? "left", color: t.text.secondary, background: t.bg.chrome, borderBottom: `1px solid ${t.stroke.secondary}`, fontWeight: 600, whiteSpace: "nowrap" }}>{header}</th>)}</tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={headers.length} style={{ padding: 14, color: t.text.tertiary }}>{emptyMessage}</td></tr> : rows.map((row: any[], rowIndex: number) => <tr key={rowIndex} style={{ background: striped && rowIndex % 2 ? t.fill.quaternary : undefined }}>{headers.map((_: any, cellIndex: number) => <td key={cellIndex} style={{ padding: "8px 10px", textAlign: columnAlign[cellIndex] ?? "left", color: t.text.primary, borderBottom: rowIndex === rows.length - 1 ? undefined : `1px solid ${t.stroke.tertiary}`, verticalAlign: "top" }}>{cellIndex === 0 && rowTone[rowIndex] && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: toneColor(t, rowTone[rowIndex]), marginRight: 7, verticalAlign: "middle" }} />}{row[cellIndex]}</td>)}</tr>)}</tbody></table></div>;
}

const inputStyle = (t: any): React.CSSProperties => ({ minHeight: 30, width: "100%", border: `1px solid ${t.stroke.primary}`, borderRadius: 5, background: t.bg.chrome, color: t.text.primary, padding: "5px 8px", outline: "none" });
export function TextInput({ value = "", onChange, placeholder, disabled, type = "text", style }: any) { const t = useHostTheme(); return <input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} disabled={disabled} type={type} style={{ ...inputStyle(t), ...style }} />; }
export function TextArea({ value = "", onChange, placeholder, disabled, rows = 3, style }: any) { const t = useHostTheme(); return <textarea value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} disabled={disabled} rows={rows} style={{ ...inputStyle(t), resize: "vertical", ...style }} />; }
export function Checkbox({ checked = false, onChange, disabled, label, style }: any) { const t = useHostTheme(); return <label style={{ display: "inline-flex", alignItems: "center", gap: 7, color: t.text.primary, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", ...style }}><input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.target.checked)} disabled={disabled} style={{ accentColor: t.accent.control }} />{label}</label>; }
export function Toggle({ checked = false, onChange, disabled, size = "sm", style }: any) { const t = useHostTheme(); const height = size === "md" ? 20 : 16; const width = size === "md" ? 36 : 30; return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange?.(!checked)} style={{ position: "relative", width, height, border: 0, borderRadius: 999, background: checked ? t.accent.control : t.fill.primary, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, ...style }}><span style={{ position: "absolute", width: height - 4, height: height - 4, left: checked ? width - height + 2 : 2, top: 2, borderRadius: "50%", background: checked ? t.text.onAccent : t.text.secondary, transition: "left .15s" }} /></button>; }
export function Select({ value = "", onChange, options, placeholder, disabled, style }: any) { const t = useHostTheme(); return <select value={value} onChange={(event) => onChange?.(event.target.value)} disabled={disabled} style={{ ...inputStyle(t), ...style }}>{placeholder && <option value="" disabled>{placeholder}</option>}{options.map((option: any) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</select>; }
export function IconButton({ children, onClick, disabled, title, variant = "default", size = "md", style }: any) { const t = useHostTheme(); const dimension = size === "sm" ? 20 : 26; return <button type="button" title={title} aria-label={title} disabled={disabled} onClick={onClick} style={{ width: dimension, height: dimension, display: "inline-grid", placeItems: "center", border: 0, borderRadius: variant === "circle" ? "50%" : 4, background: variant === "circle" ? t.fill.secondary : "transparent", color: t.text.secondary, cursor: disabled ? "not-allowed" : "pointer", ...style }}>{children}</button>; }

function ChartLegend({ series }: any) { const t = useHostTheme(); if (series.length < 2) return null; return <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>{series.map((item: any, index: number) => <span key={item.name} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: t.text.secondary, fontSize: 11 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: toneColor(t, item.tone) === t.text.primary ? chartColors[index % chartColors.length] : toneColor(t, item.tone) }} />{item.name}</span>)}</div>; }
function chartDomain(series: any[], beginAtZero = true, yMin?: number, yMax?: number, referenceLines: any[] = []) { const values = series.flatMap((item) => item.data).concat(referenceLines.map((line) => line.value)).filter(Number.isFinite); let min = yMin ?? (beginAtZero ? Math.min(0, ...values) : Math.min(...values)); let max = yMax ?? Math.max(0, ...values); if (min === max) max = min + 1; return { min, max }; }
function formatValue(value: number, prefix = "", suffix = "") { return `${prefix}${Number.isInteger(value) ? value : Number(value.toFixed(2))}${suffix}`; }

export function BarChart({ categories, series, height = 240, stacked = false, horizontal = false, normalized = false, valueSuffix = "", valuePrefix = "", showValues, beginAtZero = true, yMin, yMax, referenceLines = [], style }: any) {
  const t = useHostTheme();
  const sums = categories.map((_: any, index: number) => series.reduce((sum: number, item: any) => sum + Math.max(0, item.data[index] ?? 0), 0));
  const effectiveSeries = normalized ? series.map((item: any) => ({ ...item, data: item.data.map((value: number, index: number) => sums[index] ? value / sums[index] * 100 : 0) })) : series;
  const domain = stacked || normalized ? { min: 0, max: normalized ? 100 : Math.max(1, ...sums) } : chartDomain(effectiveSeries, beginAtZero, yMin, yMax, referenceLines);
  const colorFor = (item: any, index: number, categoryIndex: number) => item.tone ? toneColor(t, item.tone) : chartColors[(series.length === 1 ? categoryIndex : index) % chartColors.length];
  if (horizontal) return <div style={style}><div style={{ display: "grid", gap: 10 }}>{categories.map((category: string, categoryIndex: number) => <div key={category} style={{ display: "grid", gridTemplateColumns: "minmax(80px, 140px) 1fr", gap: 9, alignItems: "center" }}><span style={{ color: t.text.secondary, fontSize: 11, textAlign: "right" }}>{category}</span><div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{effectiveSeries.map((item: any, seriesIndex: number) => <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 6 }}><div title={`${item.name}: ${formatValue(item.data[categoryIndex], valuePrefix, valueSuffix)}`} style={{ height: Math.max(7, 17 / effectiveSeries.length), width: `${Math.max(0, (item.data[categoryIndex] - domain.min) / (domain.max - domain.min) * 100)}%`, background: colorFor(item, seriesIndex, categoryIndex), borderRadius: 2 }} />{(showValues ?? series.length === 1) && <span style={{ color: t.text.tertiary, fontSize: 10 }}>{formatValue(item.data[categoryIndex], valuePrefix, normalized ? "%" : valueSuffix)}</span>}</div>)}</div></div>)}</div><ChartLegend series={series} /></div>;
  const width = 640, left = 42, right = 12, top = 14, bottom = 44, plotW = width - left - right, plotH = height - top - bottom, groupW = plotW / Math.max(1, categories.length), barW = Math.max(3, Math.min(42, groupW * .72 / (stacked || normalized ? 1 : Math.max(1, series.length))));
  const y = (value: number) => top + plotH - (value - domain.min) / (domain.max - domain.min) * plotH;
  return <div style={{ width: "100%", ...style }}><svg role="img" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", width: "100%", height }}><line x1={left} y1={top + plotH} x2={width - right} y2={top + plotH} stroke={t.stroke.secondary} />{[0, .25, .5, .75, 1].map((ratio) => { const value = domain.min + (domain.max - domain.min) * ratio; const yy = y(value); return <g key={ratio}><line x1={left} y1={yy} x2={width - right} y2={yy} stroke={t.stroke.tertiary} /><text x={left - 6} y={yy + 4} textAnchor="end" fill={t.text.tertiary} fontSize="9">{formatValue(value, valuePrefix, normalized ? "%" : valueSuffix)}</text></g>; })}{referenceLines.map((line: any, index: number) => <g key={index}><line x1={left} y1={y(line.value)} x2={width - right} y2={y(line.value)} stroke={toneColor(t, line.tone)} strokeDasharray="4 4" /><text x={width - right} y={y(line.value) - 4} textAnchor="end" fill={toneColor(t, line.tone)} fontSize="9">{line.label ?? formatValue(line.value)}</text></g>)}{categories.map((category: string, categoryIndex: number) => { let stackValue = 0; return <g key={category}>{effectiveSeries.map((item: any, seriesIndex: number) => { const value = item.data[categoryIndex] ?? 0; const base = stacked || normalized ? stackValue : Math.max(0, domain.min); stackValue += value; const topValue = stacked || normalized ? stackValue : value; const x = left + categoryIndex * groupW + (groupW - (stacked || normalized ? barW : barW * series.length)) / 2 + (stacked || normalized ? 0 : seriesIndex * barW); const yy = y(Math.max(base, topValue)); const hh = Math.abs(y(base) - y(topValue)); return <g key={item.name}><rect x={x} y={yy} width={barW - 1} height={Math.max(1, hh)} rx="2" fill={colorFor(item, seriesIndex, categoryIndex)}><title>{item.name}: {formatValue(value, valuePrefix, normalized ? "%" : valueSuffix)}</title></rect>{showValues && !stacked && !normalized && <text x={x + barW / 2} y={yy - 4} textAnchor="middle" fill={t.text.secondary} fontSize="9">{formatValue(value, valuePrefix, valueSuffix)}</text>}</g>; })}<text x={left + categoryIndex * groupW + groupW / 2} y={height - 18} textAnchor="middle" fill={t.text.tertiary} fontSize="9">{category.length > 14 ? `${category.slice(0, 12)}…` : category}</text></g>; })}</svg><ChartLegend series={series} /></div>;
}

export function LineChart({ categories, series, height = 240, fill = false, valueSuffix = "", valuePrefix = "", showValues = false, beginAtZero = true, yMin, yMax, referenceLines = [], style }: any) {
  const t = useHostTheme(); const domain = chartDomain(series, beginAtZero, yMin, yMax, referenceLines); const width = 640, left = 42, right = 12, top = 16, bottom = 44, plotW = width - left - right, plotH = height - top - bottom; const x = (index: number) => left + (categories.length <= 1 ? plotW / 2 : index / (categories.length - 1) * plotW); const y = (value: number) => top + plotH - (value - domain.min) / (domain.max - domain.min) * plotH;
  return <div style={{ width: "100%", ...style }}><svg role="img" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", width: "100%", height }}>{[0, .25, .5, .75, 1].map((ratio) => { const value = domain.min + (domain.max - domain.min) * ratio; const yy = y(value); return <g key={ratio}><line x1={left} y1={yy} x2={width - right} y2={yy} stroke={t.stroke.tertiary} /><text x={left - 6} y={yy + 4} textAnchor="end" fill={t.text.tertiary} fontSize="9">{formatValue(value, valuePrefix, valueSuffix)}</text></g>; })}{referenceLines.map((line: any, index: number) => <g key={index}><line x1={left} y1={y(line.value)} x2={width - right} y2={y(line.value)} stroke={toneColor(t, line.tone)} strokeDasharray="4 4" /><text x={width - right} y={y(line.value) - 4} textAnchor="end" fill={toneColor(t, line.tone)} fontSize="9">{line.label ?? formatValue(line.value)}</text></g>)}{series.map((item: any, seriesIndex: number) => { const color = item.tone ? toneColor(t, item.tone) : chartColors[seriesIndex % chartColors.length]; const points = item.data.map((value: number, index: number) => `${x(index)},${y(value)}`).join(" "); const area = `${left},${top + plotH} ${points} ${x(item.data.length - 1)},${top + plotH}`; return <g key={item.name}>{fill && <polygon points={area} fill={color} opacity=".12" />}<polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />{item.data.map((value: number, index: number) => <g key={index}><circle cx={x(index)} cy={y(value)} r="3" fill={t.bg.editor} stroke={color} strokeWidth="2"><title>{item.name}: {formatValue(value, valuePrefix, valueSuffix)}</title></circle>{showValues && categories.length <= 20 && <text x={x(index)} y={y(value) - 7} textAnchor="middle" fill={t.text.secondary} fontSize="9">{formatValue(value, valuePrefix, valueSuffix)}</text>}</g>)}</g>; })}{categories.map((category: string, index: number) => <text key={category + index} x={x(index)} y={height - 18} textAnchor="middle" fill={t.text.tertiary} fontSize="9">{category.length > 14 ? `${category.slice(0, 12)}…` : category}</text>)}</svg><ChartLegend series={series} /></div>;
}

export function PieChart({ data, size = 200, donut = false, style }: any) {
  const t = useHostTheme(); const total = data.reduce((sum: number, item: any) => sum + Math.max(0, item.value), 0); let cursor = 0; const parts = data.map((item: any, index: number) => { const start = total ? cursor / total * 360 : 0; cursor += Math.max(0, item.value); const end = total ? cursor / total * 360 : 0; const color = item.tone ? toneColor(t, item.tone) : chartColors[index % chartColors.length]; return { ...item, start, end, color }; }); const background = `conic-gradient(${parts.map((item: any) => `${item.color} ${item.start}deg ${item.end}deg`).join(", ")})`;
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", ...style }}><div role="img" aria-label={`Total ${total}`} style={{ width: size, height: size, borderRadius: "50%", background, position: "relative", flex: "0 0 auto" }}>{donut && <div style={{ position: "absolute", inset: "27%", borderRadius: "50%", background: t.bg.editor, display: "grid", placeItems: "center", color: t.text.primary, fontSize: 20, fontWeight: 600 }}>{total}</div>}</div><div style={{ display: "grid", gap: 7 }}>{parts.map((item: any) => <div key={item.label} style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: 7, alignItems: "center", fontSize: 11 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: item.color }} /><span style={{ color: t.text.secondary }}>{item.label}</span><span style={{ color: t.text.primary, fontVariantNumeric: "tabular-nums" }}>{item.value} <small style={{ color: t.text.tertiary }}>{total ? `${(item.value / total * 100).toFixed(1)}%` : "0%"}</small></span></div>)}</div></div>;
}

export function CollapsibleSection({ title, leading, count, trailing, children, defaultOpen = false, style }: any) { const t = useHostTheme(); const [open, setOpen] = React.useState(defaultOpen); return <section style={style}><button type="button" onClick={() => setOpen(!open)} style={{ width: "100%", minHeight: 30, display: "flex", alignItems: "center", gap: 7, padding: "4px 0", border: 0, background: "transparent", color: t.text.primary, textAlign: "left", cursor: "pointer" }}><span style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform .15s" }}>›</span>{leading}<span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>{count !== undefined && <span style={{ color: t.text.tertiary, fontSize: 11 }}>{count}</span>}<span style={{ marginLeft: "auto" }}>{trailing}</span></button>{open && <div style={{ marginLeft: 17, padding: "4px 0 7px 10px", borderLeft: `1px solid ${t.stroke.tertiary}` }}>{children}</div>}</section>; }

export function Swatch({ color, style }: any) { const t = useHostTheme(); return <span aria-hidden style={{ display: "inline-block", width: 24, height: 24, borderRadius: 5, background: t.category[color] ?? t.category.gray, ...style }} />; }
export function UsageBar({ segments, total, topLeftLabel, topRightLabel, style }: any) { const t = useHostTheme(); const used = segments.reduce((sum: number, segment: any) => sum + Math.max(0, Number.isFinite(segment.value) ? segment.value : 0), 0); const safeTotal = Math.max(total, used, 1); return <div style={style}>{(topLeftLabel || topRightLabel) && <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5, color: t.text.secondary, fontSize: 11 }}><span>{topLeftLabel}</span><span>{topRightLabel}</span></div>}<div style={{ height: 8, display: "flex", gap: 2, borderRadius: 999, overflow: "hidden", background: t.fill.secondary }}>{segments.map((segment: any, index: number) => <span key={segment.id} title={`${segment.id}: ${segment.value}`} style={{ flexBasis: `${Math.max(0, segment.value) / safeTotal * 100}%`, background: t.category[segment.color ?? usageColorSequence[index % usageColorSequence.length]] }} />)}{used < safeTotal && <span style={{ flex: 1, background: t.fill.tertiary }} />}</div></div>; }

export function DiffStats({ additions = 0, deletions = 0, style }: any) { const t = useHostTheme(); if (!additions && !deletions) return null; return <span style={{ display: "inline-flex", gap: 6, fontSize: 11, fontVariantNumeric: "tabular-nums", ...style }}>{additions > 0 && <span style={{ color: t.category.green }}>+{additions}</span>}{deletions > 0 && <span style={{ color: t.category.red }}>-{deletions}</span>}</span>; }
export function DiffView({ lines, showLineNumbers = true, coloredLineNumbers = true, showAccentStrip = true, style }: any) { const t = useHostTheme(); return <div style={{ overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace", fontSize: 11, lineHeight: "18px", ...style }}>{lines.map((line: any, index: number) => { const added = line.type === "added", removed = line.type === "removed"; const color = added ? t.category.green : removed ? t.category.red : t.text.tertiary; return <div key={index} style={{ display: "grid", gridTemplateColumns: `${showAccentStrip ? "3px " : ""}${showLineNumbers ? "46px " : ""}1fr`, background: added ? t.diff.insertedLine : removed ? t.diff.removedLine : undefined, minWidth: "max-content" }}>{showAccentStrip && <span style={{ background: added ? t.diff.stripAdded : removed ? t.diff.stripRemoved : "transparent" }} />}{showLineNumbers && <span style={{ padding: "0 8px", textAlign: "right", color: coloredLineNumbers ? color : t.text.quaternary, userSelect: "none" }}>{line.lineNumber ?? ""}</span>}<span style={{ padding: "0 10px", whiteSpace: "pre", color: t.text.primary }}><span style={{ color }}>{added ? "+" : removed ? "-" : " "}</span>{line.content}</span></div>; })}</div>; }

export function TodoList({ todos, dimmedTodoIds, onTodoClick, style }: any) { const t = useHostTheme(); if (!todos?.length) return null; const icon: any = { pending: "○", in_progress: "◐", completed: "✓", cancelled: "×" }; return <div style={{ display: "grid", gap: 2, ...style }}>{todos.map((todo: any) => <button type="button" key={todo.id} onClick={() => onTodoClick?.(todo)} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: 7, padding: "6px 7px", border: 0, borderRadius: 4, background: "transparent", color: t.text.primary, textAlign: "left", cursor: onTodoClick ? "pointer" : "default", opacity: dimmedTodoIds?.has(todo.id) ? .4 : 1 }}><span style={{ color: todo.status === "completed" ? t.category.green : todo.status === "cancelled" ? t.category.red : todo.status === "in_progress" ? t.category.blue : t.text.tertiary }}>{icon[todo.status]}</span><span style={{ fontSize: 12, lineHeight: "17px", textDecoration: todo.status === "completed" ? "line-through" : undefined }}>{todo.content}</span></button>)}</div>; }
export function TodoListCard({ todos, dimmedTodoIds, defaultExpanded = false, onTodoClick, style }: any) { if (!todos?.length) return null; const done = todos.filter((todo: any) => todo.status === "completed").length; return <Card collapsible defaultOpen={defaultExpanded} style={style}><CardHeader trailing={<Text as="span" size="small" tone="tertiary">{done} of {todos.length} Done</Text>}>Tasks</CardHeader><CardBody><TodoList todos={todos} dimmedTodoIds={dimmedTodoIds} onTodoClick={onTodoClick} /></CardBody></Card>; }

export function computeDAGLayout({ nodes, edges, direction = "vertical", nodeWidth = 160, nodeHeight = 40, rankGap = 64, nodeGap = 48, padding = 24 }: any) {
  const ids = new Set(nodes.map((node: any) => node.id)); const outgoing = new Map(nodes.map((node: any) => [node.id, []])); const indegree = new Map(nodes.map((node: any) => [node.id, 0]));
  edges.forEach((edge: any) => { if (ids.has(edge.from) && ids.has(edge.to)) { outgoing.get(edge.from).push(edge.to); indegree.set(edge.to, indegree.get(edge.to) + 1); } });
  const queue = nodes.filter((node: any) => indegree.get(node.id) === 0).map((node: any) => node.id); const ranks = new Map(nodes.map((node: any) => [node.id, 0])); const visited = new Set();
  while (queue.length) { const id = queue.shift(); visited.add(id); for (const target of outgoing.get(id)) { ranks.set(target, Math.max(ranks.get(target), ranks.get(id) + 1)); indegree.set(target, indegree.get(target) - 1); if (indegree.get(target) === 0) queue.push(target); } }
  nodes.forEach((node: any) => { if (!visited.has(node.id)) ranks.set(node.id, 0); }); const grouped = new Map(); nodes.forEach((node: any) => { const rank = ranks.get(node.id); if (!grouped.has(rank)) grouped.set(rank, []); grouped.get(rank).push(node.id); }); const orderedRanks = [...grouped.keys()].sort((a, b) => a - b); const maxInRank = Math.max(1, ...[...grouped.values()].map((list: any[]) => list.length)); const verticalWidth = padding * 2 + maxInRank * nodeWidth + Math.max(0, maxInRank - 1) * nodeGap; const verticalHeight = padding * 2 + orderedRanks.length * nodeHeight + Math.max(0, orderedRanks.length - 1) * rankGap; const positioned: any[] = []; const rankBoxes: any[] = [];
  orderedRanks.forEach((rank) => { const list = grouped.get(rank); const span = list.length * nodeWidth + Math.max(0, list.length - 1) * nodeGap; list.forEach((id: string, order: number) => { const vx = padding + (verticalWidth - padding * 2 - span) / 2 + order * (nodeWidth + nodeGap); const vy = padding + rank * (nodeHeight + rankGap); positioned.push({ id, x: direction === "vertical" ? vx : vy, y: direction === "vertical" ? vy : vx, rank, order }); }); rankBoxes.push({ rank, x: direction === "vertical" ? padding : padding + rank * (nodeHeight + rankGap), y: direction === "vertical" ? padding + rank * (nodeHeight + rankGap) : padding, width: direction === "vertical" ? verticalWidth - padding * 2 : nodeHeight, height: direction === "vertical" ? nodeHeight : verticalWidth - padding * 2, nodeIds: list }); }); const byId = new Map(positioned.map((node) => [node.id, node])); const laidEdges = edges.filter((edge: any) => byId.has(edge.from) && byId.has(edge.to)).map((edge: any) => { const source = byId.get(edge.from), target = byId.get(edge.to), isBackEdge = target.rank <= source.rank; return direction === "vertical" ? { ...edge, sourceX: source.x + nodeWidth / 2, sourceY: source.y + nodeHeight, targetX: target.x + nodeWidth / 2, targetY: target.y, isBackEdge } : { ...edge, sourceX: source.x + nodeHeight, sourceY: source.y + nodeWidth / 2, targetX: target.x, targetY: target.y + nodeWidth / 2, isBackEdge }; }); return { nodes: positioned, edges: laidEdges, ranks: rankBoxes, direction, width: direction === "vertical" ? verticalWidth : verticalHeight, height: direction === "vertical" ? verticalHeight : verticalWidth };
}
