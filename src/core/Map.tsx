import React, { Ref } from 'react'
import "./map.css"

export interface MapProps{
    style?: React.CSSProperties,
    children?: React.ReactNode
}
export default function Map(ref: any) {
  return (props: MapProps) => {
    return (
    
    <div style={{...props.style, overflow: "hidden"}} >
        <div style={{position: "relative", height: "100%"}}>

            {/*Div for map to render*/}
            <div ref={ref} style={{border: "5px solid green", position: "absolute", left: 0, top: 0, right: 0, bottom:0, overflow: "hidden"}}></div>

            {/*Div for panels and other custom elements*/}
            <div style={{position: "absolute", left:0, top:0,right:0, bottom:0}} className='throughInteractable'>
                {props.children}
            </div>

        </div>
    </div>
  )};
}
