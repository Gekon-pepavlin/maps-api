import React, { useCallback, useEffect, useMemo } from "react";
import { usePanorama } from "./usePanorama";
import {
    MarkersPlugin,
    ReactPhotoSphereViewer
} from "react-photo-sphere-viewer";
import { Viewer, PluginConstructor } from "@photo-sphere-viewer/core";
import { PanoramaPoint } from "./PanoramaPoint";

// props as div
type PanoramaContainerProps = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> & {
    children?: React.ReactNode;
    default: string;
    distanceThreshold?: number;
};

export function PanoramaContainer({
    distanceThreshold = 0.5,
    ...props
}: PanoramaContainerProps) {
    const { url, isOpened, list, open, _setYaw, _setLocation } = usePanorama();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [progress, setProgress] = React.useState<number>(0);

    const plugins: PluginConstructor | PluginConstructor[] = [MarkersPlugin];

    const [viewer, setViewer] = React.useState<Viewer | null>(null);

    const onPanoramaLoaded = (e: Viewer) => {
        const markersPlugin: MarkersPlugin = e.getPlugin(MarkersPlugin);
        markersPlugin.removeMarkers(
            markersPlugin.getMarkers().map((e) => e.id)
        );

        const currentPoint = list.find((e) => e.url === url);
        if (!currentPoint) return;

        _setLocation(currentPoint.location);

        const closePoints = getClosePoints(currentPoint);
        closePoints.forEach((e) => {
            markersPlugin?.addMarker({
                id: e.url,
                html:
                    '<div style="width: 50px; ' +
                    "height: 50px;  border-radius: 30%; " +
                    "filter: drop-shadow(0px 0px 10px rgba(0,0,0,0.5)); " +
                    "opacity: 0.8;" +
                    "display: flex; justify-content: center; align-items: center;" +
                    'transform:translate(-50%, -50%); font-size: 80px; color: white";><strong>⦿</strong></div>',

                position: {
                    yaw: e.direction.yaw + "deg",
                    pitch: e.direction.pitch + "deg"
                }
            });
            markersPlugin.addEventListener("select-marker", (e) => {
                const marker = e.marker;
                const url = marker.id;
                markersPlugin.removeMarkers(
                    markersPlugin.getMarkers().map((e) => e.id)
                );
                open(url);
            });
        });
    };
    const onPanoramaLoadedHandler = (e: any) => {
        onPanoramaLoaded(e.target);
    };

    const isInSimilarDirection = (a: number, b: number, threshold: number) => {
        const diff = Math.abs(a - b);
        return diff < threshold || diff > 360 - threshold;
    };

    useEffect(() => {
        viewer?.removeEventListener("panorama-loaded", onPanoramaLoadedHandler);
        viewer?.addEventListener("panorama-loaded", onPanoramaLoadedHandler);
    }, [list, viewer, url]);

    useEffect(() => {
        if (!viewer) return;

        const handle = (e: any) => {
            const { pitch, yaw } = e.position;

            _setYaw(yaw);
        };
        viewer.addEventListener("before-rotate", handle);

        return () => {
            viewer.removeEventListener("before-rotate", handle);
        };
    }, [viewer]);

    const getPointDirection = (
        current: PanoramaPoint,
        target: PanoramaPoint
    ) => {
        //Calculate yaw from lat and lng. Yaw is angle from 0 to 360 degrees
        const yaw =
            (Math.atan2(
                target.location[1] - current.location[1],
                target.location[0] - current.location[0]
            ) *
                180) /
            Math.PI;

        const distance = getDistanceFromLatLonInKm(
            current.location[0],
            current.location[1],
            target.location[0],
            target.location[1]
        );
        const pitch = (1 - distance * 10) * -5;

        return {
            yaw: yaw - current.direction,
            pitch: pitch
        };
    };

    function getDistanceFromLatLonInKm(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1); // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) *
                Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }

    const getClosePoints = (point: PanoramaPoint) => {
        const points = list.filter((e) => e.url !== point.url);
        points.sort((a, b) => {
            const aDistance = getDistanceFromLatLonInKm(
                a.location[0],
                a.location[1],
                point.location[0],
                point.location[1]
            );
            const bDistance = getDistanceFromLatLonInKm(
                b.location[0],
                b.location[1],
                point.location[0],
                point.location[1]
            );
            return aDistance - bDistance;
        });

        const withDirection = points
            .splice(0, 10)
            .filter((p) => {
                return (
                    getDistanceFromLatLonInKm(
                        p.location[0],
                        p.location[1],
                        point.location[0],
                        point.location[1]
                    ) < distanceThreshold
                );
            })
            .map((e) => ({
                ...e,
                direction: getPointDirection(point, e)
            }));

        const directionThreshold = 50;
        const maxCount = 5;
        const arr = [withDirection[0]];
        for (let i = 0; i < withDirection.length; i++) {
            const current = withDirection[i];
            let foundSimilar = false;
            for (let a = 0; a < arr.length; a++) {
                if (
                    isInSimilarDirection(
                        arr[a].direction.yaw,
                        current.direction.yaw,
                        directionThreshold
                    )
                ) {
                    foundSimilar = true;
                    break;
                }
            }
            if (!foundSimilar) {
                arr.push(current);
            }

            if (arr.length >= maxCount) {
                break;
            }
        }

        return arr;
    };

    const onReady = (e: Viewer) => {
        setViewer(e);
        e.addEventListener("load-progress", (e) => {
            setLoading(e.progress < 100);
            setProgress(e.progress);
        });
    };

    useEffect(() => {
        if (!viewer) return;

        const markersPlugin: MarkersPlugin = viewer.getPlugin(MarkersPlugin);
        markersPlugin.removeMarkers(
            markersPlugin.getMarkers().map((e) => e.id)
        );

        viewer.setPanorama(url, {
            transition: true
        });
    }, [url]);

    return (
        <div
            {...props}
            style={{
                pointerEvents: isOpened ? "auto" : "none",
                display: isOpened ? "block" : "none",
                ...props.style
            }}>
            {
                <ReactPhotoSphereViewer
                    src={props.default}
                    height={"100%"}
                    width={"100%"}
                    container={""}
                    plugins={plugins}
                    onReady={onReady}
                    loadingTxt={undefined}
                />
            }
            {
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        transform: "translateY(-100%)",
                        backdropFilter: loading ? "blur(20px)" : "blur(0px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease 0.5s",
                        pointerEvents: "none",
                        zIndex: 100
                    }}>
                    {loading && <b>Načítání... {progress}%</b>}
                </div>
            }

            {isOpened && (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 101,
                        pointerEvents: "none"
                    }}>
                    {React.Children.map(props.children, (child) => {
                        return React.cloneElement(child as React.ReactElement, {
                            style: {
                                pointerEvents: "auto",
                                ...((child as React.ReactElement).props.style ||
                                    {})
                            }
                        });
                    })}
                </div>
            )}
        </div>
    );
}
