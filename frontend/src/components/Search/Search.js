import React, { useState } from "react";
import "./search.css";
import { Form, Button, DropdownButton, Dropdown } from "react-bootstrap";

function Search(props) {

    const [ search, setSearch ] = useState('');
    const [ lat, setLat ] = useState('');
    const [ long, setLong ] = useState('');
    const [ recentType, setRecentType ] = useState('');

    const attemptSearch = (type) => {
        if (type === "location") {
            if (lat === '' || long === '') {
                return;
            }
            setSearch('');
        }

        let query = search.trim();
        if (type === "search" && query === '') {
            props.searchDatabase([], []);
        }

        let searchValues = [];
        let searchTypes = [];

        if (type === "asc" || type === 'desc') {
            // check most recent search type and go from there
            if (recentType === "search") {
                searchValues.push(search);
                searchTypes.push("search");
            } else if (recentType === "location") {
                searchValues.push(lat);
                searchTypes.push("lat");
                searchValues.push(long);
                searchTypes.push("long");
            }

            searchValues.push(type);
            searchTypes.push("sort");
        } else if (type === "search") {
            searchValues.push(query);
            searchTypes.push(type);

            setRecentType(type);

            setLat('');
            setLong('');
        } else if (type === "location") {
            searchValues.push(lat);
            searchTypes.push("lat");
            searchValues.push(long);
            searchTypes.push("long");

            setRecentType(type);
        }

        // search
        props.searchDatabase(searchValues, searchTypes);
    }

    return (
        <div className="search-container">
            <Form className="search-form" onSubmit={(e) => {e.preventDefault();}}>
                <p>search by keyword: </p>
                <Form.Group>
                    <Form.Control className="search-form-input" type="search" value={search} placeholder="city, state, etc." onChange={(e) => {setSearch(e.target.value); if(e.target.value === "") {props.searchDatabase([], []);}}} />
                </Form.Group>
                <Button type="button" className="search-form-button" onClick={(e) => attemptSearch("search")}>Search</Button>

                <DropdownButton id="dropdown-basic-button" title="Sort Results" className="sort-results">
                    <Dropdown.Item as="button" type="button" onClick={(e) => {attemptSearch("asc");}}>Increasing Avg. Temp</Dropdown.Item>
                    <Dropdown.Item as="button" type="button" onClick={(e) => {attemptSearch("desc");}}>Decreasing Avg. Temp</Dropdown.Item>
                </DropdownButton>
            </Form>
            <div className="location-search-container">
                <p className="location-desc">or search by latitude and longitude: </p>
                <Form className="search-by-location-form" onSubmit={(e) => {e.preventDefault();}}>
                    <Form.Group>
                        <Form.Control id="search-location-latitude" className="search-location-input" placeholder="Latitude" type="search" value={lat} onChange={(e) => setLat(e.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control id="search-location-longitude" className="search-location-input" placeholder="Longitude" type="search" value={long} onChange={(e) => setLong(e.target.value)} />
                    </Form.Group>
                    <Button type="button" className="search-form-button" onClick={(e) => attemptSearch("location")} >Search</Button>
                </Form>
            </div>
        </div>
    );

}

export default Search;