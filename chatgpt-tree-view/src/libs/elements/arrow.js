import React from 'react'
import { getBoxToBoxArrow } from 'curved-arrows'

const Arrow = ({ x0, y0, w0, h0, x1, y1, w1, h1 }) => {
    const arrowHeadSize = 9
    const strokeWidth = 2
    const color = 'white'
    const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
        x0,
        y0,
        w0,
        h0,
        x1,
        y1,
        w1,
        h1,
        {
            padStart: 0,
            padEnd: arrowHeadSize,
            allowedStartSides: ['right'],
            allowedEndSides: ['left'],
        }
    )

    // Calculate the bounding box for the arrow path
    const minX = Math.min(sx, c1x, c2x, ex) - arrowHeadSize
    const maxX = Math.max(sx, c1x, c2x, ex) + arrowHeadSize * 2
    const minY = Math.min(sy, c1y, c2y, ey) - arrowHeadSize
    const maxY = Math.max(sy, c1y, c2y, ey) + arrowHeadSize
    const width = maxX - minX
    const height = maxY - minY

    return (
        <svg
            className="absolute"
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            style={{
                transform: `translate(${minX}px, ${minY}px)`,
                zIndex: 999,
            }}
        >
            <path
                d={`M ${sx - minX} ${sy - minY} C ${c1x - minX} ${
                    c1y - minY
                }, ${c2x - minX} ${c2y - minY}, ${ex - minX} ${ey - minY}`}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
            />
            <polygon
                points={`0,${-arrowHeadSize} ${
                    arrowHeadSize * 2
                },0, 0,${arrowHeadSize}`}
                transform={`translate(${ex - minX}, ${
                    ey - minY
                }) rotate(${ae})`}
                fill={color}
            />
        </svg>
    )
}

export { Arrow }
