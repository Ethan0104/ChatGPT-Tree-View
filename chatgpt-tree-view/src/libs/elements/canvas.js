import React, { useRef, useEffect, useState } from 'react'

// const Canvas = () => { // not actually a canvas element

//     return (
//         <div id="chatgpt-tree-view-canvas">

//         </div>
//     )
// }

const Canvas = ({child1, child2}) => { // not actually a canvas element
    const canvasRef = useRef(null);
    const parentRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [scale, setScale] = useState(1);
    const [initialDistance, setInitialDistance] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = parentRef.current;

        const handleMouseDown = (event) => {
            if (event.button === 1) { // Middle mouse button
                setIsPanning(true);
                setStartX(event.clientX - translateX);
                setStartY(event.clientY - translateY);
                canvas.style.cursor = 'grabbing';
            }
        };

        const handleMouseUp = () => {
            setIsPanning(false);
            canvas.style.cursor = 'grab';
        };

        const handleMouseMove = (event) => {
            if (!isPanning) return;
            setTranslateX(event.clientX - startX);
            setTranslateY(event.clientY - startY);
            parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        };

        const handleWheel = (event) => {
            if (!canvas.contains(event.target)) return;

            event.preventDefault();

            if (event.ctrlKey || event.metaKey) {
                // Zooming
                const zoomIntensity = 0.01;
                const scrollDirection = event.deltaY > 0 ? -1 : 1;

                // Get the bounding box of the parent element
                const parentRect = parent.getBoundingClientRect();

                // Calculate the center point of the canvas relative to the parent element
                const canvasCenterX = (canvas.clientWidth / 2 - parentRect.left) / scale;
                const canvasCenterY = (canvas.clientHeight / 2 - parentRect.top) / scale;

                // Calculate the new scale
                const newScale = scale + scrollDirection * zoomIntensity;
                if (newScale > 0.1) {
                    // Adjust the translate values to keep the center of the canvas in focus
                    setTranslateX(translateX - (canvasCenterX * (newScale - scale)));
                    setTranslateY(translateY - (canvasCenterY * (newScale - scale)));
                    setScale(newScale);
                    parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                }
            } else {
                // Panning
                setTranslateX(translateX - event.deltaX);
                setTranslateY(translateY - event.deltaY);
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        };

        const handleMouseLeave = () => {
            setIsPanning(false);
            canvas.style.cursor = 'grab';
        };

        const handleGestureStart = (event) => {
            if (!canvas.contains(event.target)) return;
            event.preventDefault();
        };

        const handleGestureChange = (event) => {
            if (!canvas.contains(event.target)) return;
            event.preventDefault();
            const newScale = scale * event.scale;
            if (newScale > 0.1) {
                const parentRect = parent.getBoundingClientRect();
                const canvasCenterX = (canvas.clientWidth / 2 - parentRect.left) / scale;
                const canvasCenterY = (canvas.clientHeight / 2 - parentRect.top) / scale;
                setTranslateX(translateX - (canvasCenterX * (newScale - scale)));
                setTranslateY(translateY - (canvasCenterY * (newScale - scale)));
                setScale(newScale);
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        };

        const handleTouchStart = (event) => {
            if (event.touches.length === 1) {
                setIsPanning(true);
                const touch = event.touches[0];
                setStartX(touch.clientX - translateX);
                setStartY(touch.clientY - translateY);
                canvas.style.cursor = 'grabbing';
            } else if (event.touches.length === 2) {
                setIsPanning(false);
                setInitialDistance(getDistance(event.touches[0], event.touches[1]));
            }
        };

        const handleTouchMove = (event) => {
            if (isPanning && event.touches.length === 1) {
                const touch = event.touches[0];
                setTranslateX(touch.clientX - startX);
                setTranslateY(touch.clientY - startY);
                parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            } else if (event.touches.length === 2) {
                event.preventDefault();
                const newDistance = getDistance(event.touches[0], event.touches[1]);
                const zoomFactor = newDistance / initialDistance;
                const newScale = scale * zoomFactor;
                if (newScale > 0.1) {
                    const parentRect = parent.getBoundingClientRect();
                    const canvasCenterX = (canvas.clientWidth / 2 - parentRect.left) / scale;
                    const canvasCenterY = (canvas.clientHeight / 2 - parentRect.top) / scale;
                    setTranslateX(translateX - (canvasCenterX * (newScale - scale)));
                    setTranslateY(translateY - (canvasCenterY * (newScale - scale)));
                    setScale(newScale);
                    parent.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                }
            }
        };

        const handleTouchEnd = () => {
            setIsPanning(false);
            canvas.style.cursor = 'grab';
        };

        const getDistance = (touch1, touch2) => {
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('gesturestart', handleGestureStart);
        canvas.addEventListener('gesturechange', handleGestureChange);
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('contextmenu', (event) => {
            if (event.button === 1) {
                event.preventDefault();
            }
        });

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('gesturestart', handleGestureStart);
            canvas.removeEventListener('gesturechange', handleGestureChange);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isPanning, startX, startY, translateX, translateY, scale, initialDistance]);

    return (
        <div className="canvas h-full" ref={canvasRef}>
            <div className="parent h-full" ref={parentRef}>
                {child1}
                {child2}
            </div>
        </div>
    );
};

export { Canvas }