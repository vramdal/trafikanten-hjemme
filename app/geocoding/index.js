export type Coordinates = {lat: number, long: number};
export interface Geocoder {
    getCoordinates(str : string) : Promise<Coordinates>;
}
