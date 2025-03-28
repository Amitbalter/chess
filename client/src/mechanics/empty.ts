export interface EmptyInterface {
    label: string;
    color: string;
    castle: string;
}

export default class Empty implements EmptyInterface {
    label: string;
    color: string;
    castle: string;

    constructor() {
        this.label = "";
        this.color = "";
        this.castle = "";
    }
}
