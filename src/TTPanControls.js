import PanControls from '@tomtom-international/web-sdk-plugin-pancontrols';

export default class TTPanControls {

    constructor(params) {
        const {map, options, position} = params;
        
        map.addControl(new PanControls(options), position);
    }
}