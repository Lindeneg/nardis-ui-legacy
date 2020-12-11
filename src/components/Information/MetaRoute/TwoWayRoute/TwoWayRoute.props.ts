import { City } from 'nardis-game';


export default interface ITwoWayRouteProps {
    cityOne: City | null,
    cityTwo: City | null,
    routesLength: number,
    otherRoutesLength: number,
    whenClickOrigin: () => void,
    whenClickDestination: () => void
}