import ZoomControls from '@tomtom-international/web-sdk-plugin-zoomcontrols';

export default class TTZoomControls {

    constructor(params) {
        const {map, options, position} = params;
        
        map.addControl(new ZoomControls(options), position);
    }
}