declare module "liquid-gl" {
  type LiquidLens = { destroy?: () => void; setTint?: (tint: string) => void; setDraggable?: (on: boolean) => void }
  const liquidGL: ((options: Record<string, unknown>) => LiquidLens | LiquidLens[]) & {
    registerDynamic?: (el: string | Element | Element[]) => void
    syncWith?: (config?: Record<string, unknown>) => unknown
  }
  export default liquidGL
}
