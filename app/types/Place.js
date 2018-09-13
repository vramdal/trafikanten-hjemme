export type LatLong = {
    latitude: number,
    longitude: number
}

export type Location = {
    name : string,
    coordinates : LatLong
}

export type DatePeriod = {
    startDate: Date,
    endDate: Date
}