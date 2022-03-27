import React from "react";
import "./item-card.css";
import { Card } from "react-bootstrap";

function ItemCard(props) {

    let cityTemp = props.cityTemp;

    return (
        <Card className="city-temps-card" onClick={(e) => {props.setShowModal(true); props.setShowCityTemp(cityTemp);}}>
            <Card.Header>
                <Card.Title>{cityTemp.city}, {cityTemp.country}</Card.Title>
                <Card.Subtitle>Date: {cityTemp.dt}</Card.Subtitle>
            </Card.Header>
            <Card.Body>
                <Card.Text>Average Temperature: {cityTemp.averagetemperature.toFixed(2)} &deg;C</Card.Text>
            </Card.Body>
        </Card>
    );

}

export default ItemCard;