import * as tt from '@tomtom-international/web-sdk-maps';

export default class MarkerPopup {

    constructor({options, html}) {
        const popup = new tt.Popup(options);
        popup.setHTML(html);

        return popup;
    }
}