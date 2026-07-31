"use client"

import React from "react"
import { cn } from "../../lib/utils"

export interface CarouselImage {
  src: string
  alt?: string
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[]
  containerClassName?: string
  cardClassName?: string
  animationDuration?: number // in seconds
  cardWidth?: number // in pixels
  /** Optional custom card renderer. Defaults to an <img>. */
  renderCard?: (item: CarouselImage, index: number) => React.ReactNode
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 32,
      cardWidth = 250,
      renderCard,
      ...props
    },
    ref,
  ) => {
    const N = images.length

    const customStyle = {
      "--n": N,
      "--w": `${cardWidth}px`,
      "--ba": `calc(1turn / var(--n))`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties

    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-full min-h-[500px] grid place-items-center overflow-hidden",
          className,
        )}
        style={{
          perspective: "35em",
          maskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
        }}
        {...props}
      >
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d] motion-reduce:!animate-[ry_128s_linear_infinite]",
            containerClassName,
          )}
          style={{
            ...customStyle,
            animation: "ry var(--anim-dur) linear infinite",
          }}
        >
          <style>{`
              @keyframes ry {
                to { transform: rotateY(1turn); }
              }
            `}</style>

          {images.map((img, i) => {
            const cardStyle = {
              width: "var(--w)",
              aspectRatio: "7/10",
              "--i": i,
              transform:
                "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
            } as React.CSSProperties

            return renderCard ? (
              <div
                key={i}
                className={cn("[grid-area:1/1] [backface-visibility:hidden]", cardClassName)}
                style={cardStyle}
              >
                {renderCard(img, i)}
              </div>
            ) : (
              <img
                key={i}
                src={img.src}
                alt={img.alt || `Carousel image ${i}`}
                className={cn(
                  "[grid-area:1/1] object-cover rounded-2xl [backface-visibility:hidden]",
                  cardClassName,
                )}
                style={cardStyle}
              />
            )
          })}
        </div>
      </div>
    )
  },
)

CylinderCarousel.displayName = "CylinderCarousel"

export default CylinderCarousel
