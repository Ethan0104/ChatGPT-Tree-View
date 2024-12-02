import React from 'react'
import { getBoxToBoxArrow } from 'curved-arrows'

import ArrowParam from '../models/arrow-param'

const Arrow: React.FC<ArrowParam> = ({ x0, y0, w0, h0, x1, y1, w1, h1, isHighlighted }) => {
    const arrowHeadSize = 9
    const strokeWidth = 2
    const strokeClass = isHighlighted ? 'tree-stroke-dark-primary' : 'tree-stroke-dark-arrowColor'
    const fillClass = isHighlighted ? 'tree-fill-dark-primary' : 'tree-fill-dark-arrowColor'
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
            allowedStartSides: ['bottom'],
            allowedEndSides: ['top'],
        }
    )

    // Calculate the bounding box for the arrow path
    const minX = Math.min(sx, c1x, c2x, ex) - arrowHeadSize
    const maxX = Math.max(sx, c1x, c2x, ex) + arrowHeadSize
    const minY = Math.min(sy, c1y, c2y, ey) - arrowHeadSize
    const maxY = Math.max(sy, c1y, c2y, ey) + arrowHeadSize * 2
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
                zIndex: 0,
            }}
        >
            <path
                d={`M ${sx - minX} ${sy - minY} C ${c1x - minX} ${
                    c1y - minY
                }, ${c2x - minX} ${c2y - minY}, ${ex - minX} ${ey - minY}`}
                className={strokeClass}
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
                className={fillClass}
            />
        </svg>
    )
}

export default Arrow
