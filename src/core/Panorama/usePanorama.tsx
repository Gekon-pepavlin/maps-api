import React, { createContext, useContext } from 'react';
import { PanoramaPoint } from './PanoramaPoint';
import { LocationPoint } from '../LocationPoint';

type IPanoramaProvider = ReturnType<typeof useProvidePanorama>;
const PanoramaContext = createContext<IPanoramaProvider>({
    url: "",
    isOpened: false,
    open: ()=>{},
    setList: ()=>{},
    list: [],
    initialized: false,
    close: ()=>{},
    location: null,
    _setLocation: ()=>{},
    yaw: 0,
    _setYaw: ()=>{}
});

export const usePanorama = () : IPanoramaProvider => {
    const panorama = useContext(PanoramaContext);
    if (!panorama.initialized) {
        throw new Error('usePanorama must be used within a PanoramaProvider');
    }
    return panorama;
};

export const PanoramaProvider = ({ children } : {children: React.ReactNode}) => {
    const panorama = useProvidePanorama();

    return (
        <PanoramaContext.Provider value={panorama}>
            {children}
        </PanoramaContext.Provider>
    );
};

export const useProvidePanorama = () => {
    const [url, setUrl] = React.useState<string>("");
    const [isOpened, setIsOpened] = React.useState<boolean>(false);

    const [list, sl] = React.useState<PanoramaPoint[]>([]);

    const [location, _setLocation] = React.useState<LocationPoint | null>(null);
    const [yaw, _setYaw] = React.useState<number>(0);

    const setList = (list: PanoramaPoint[])=>{
        sl(list);
    }

    const open = (url: string) => {
        setUrl(url);
        setIsOpened(true);
    }
    const close = () => {
        setIsOpened(false);
    }
    return {
        list,
        setList,
        open, close,
        url, isOpened,
        initialized:true,
        location, _setLocation,
        yaw, _setYaw
    }
}
