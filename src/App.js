import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import ItemCard from './components/ItemCard/ItemCard';
import Search from './components/Search/Search';
import { Pagination, Modal, Button, Form } from 'react-bootstrap';
import { showAll, addComment } from './services/CityTemps.service';

function ItemModal({cityTemp, attemptComment, ...props}) {
  const [ comment, setComment ] = useState('');

  const attemptAddComment = () => {

    if (comment === '') {
      return;
    }

    let data = {
        id: cityTemp._id,
        comment: comment
    }

    if (cityTemp.comment) {
      cityTemp.comment = comment;
    }

    attemptComment(data);
  }

  return (
    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {cityTemp.city}, {cityTemp.country} Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='city-temp-body'>
        <div className='city-temp-left'>
          <h5>Date: {cityTemp.dt}</h5>
          <h5>Avg. Temperature: {cityTemp.averagetemperature.toFixed(2)} &deg;C</h5>
          <p>Latitude: {cityTemp.latitude}</p>
          <p>Longitude: {cityTemp.longitude}</p>
        </div>
        <div className='city-temp-right'>
          { cityTemp.flag.flag_image_url &&
            <img alt={cityTemp.city + " flag"} src={cityTemp.flag.flag_image_url}></img>
          }
        </div>


        { cityTemp.comment &&
          <div className='comments-container'>
            <h5>Comments: </h5>
            <p>{cityTemp.comment}</p>
          </div>
        }

        <Form className="add-comment-form" onSubmit={(e) => {e.preventDefault();}}>
            <Form.Group>
                <h5>Add New Comment:</h5>
                <Form.Control className="add-comment-input" as="textarea" value={comment} onChange={(e) => setComment(e.target.value)} />
                <Button className='add-comment-button' type="button" variant="primary" onClick={(e) => {attemptAddComment()}}>Add Comment</Button>
            </Form.Group>
        </Form> 
      </Modal.Body>
    </Modal>
  );
}

function App() {

  const [ cityTemps, setCityTemps ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ maxPage, setMaxPage ] = useState(0);
  const [ isBusy, setIsBusy ] = useState(true);
  const [ last_search, setLastSearch ] = useState('');
  const [ last_sort, setLastSort ] = useState('');
  const [ last_lat, setLastLat ] = useState('');
  const [ last_long, setLastLong ] = useState('');

  const [ showModal, setShowModal ] = useState(false);
  const [ showCityTemp, setShowCityTemp ] = useState({});

  const attemptComment = (data) => {
    addComment(data).then((res) => {
      console.log(res);
      setShowModal(false);
    }).catch((error) => {
      console.log(error);
    });

    // setIsBusy(true);
    // changePage(page);
  }

  const searchDatabase = (search, type) => {
    // call service to handle this
    let query = "?";

    // search and type are both arrays
    if (search.length !== type.length) {
      return;
    }

    // clear last variables
    setLastLat('');
    setLastLong('');
    setLastSearch('');
    setLastSort('');

    if (search.length === 0 && type.length === 0) {
      setIsBusy(true);
      showAll().then((temps) => {
        setCityTemps(temps.data);
        setPage(temps.page);
        setMaxPage(temps.last_page);
        setIsBusy(false);
      });
      return;
    }

    // otherwise loop through
    type.forEach(t => {
      // get whatever the search is
      let value = search[type.indexOf(t)];

      if (query === "?") {
        if (t === "search") {
          query += `s=${value}`;
          setLastSearch(value);
        } else if (t === "lat" || t === "long") {
          query += `${t}=${value}`;
          if (t === "lat") {
            setLastLat(value);
          } else {
            setLastLong(value);
          }
        } else if (t === "sort") {
          query += `${t}=${value}`;
          setLastSort(value);
        }
      } else {
        if (t === "search") {
          query += `&s=${value}`;
          setLastSearch(value);
        } else if (t === "lat" || t === "long") {
          query += `&${t}=${value}`;
          if (t === "lat") {
            setLastLat(value);
          } else {
            setLastLong(value);
          }
        } else if (t === "sort") {
          query += `&${t}=${value}`;
          setLastSort(value);
        }
      }
    });

    // call method with query
    setIsBusy(true);
    showAll(query).then((temps) => {
      setCityTemps(temps.data);
      setPage(temps.page);
      setMaxPage(temps.last_page);
      setIsBusy(false);
    }).catch((error) => {
      console.log(error);
    });
  }

  const renderPagination = () => {
    // grab 3 before current and 3 after current
    let pages = [];
    let inRange = true;

    // verify current is not first or last page
    if (page <= 0 || page > maxPage) {
      return;
    }

    if (page === 1 ||page === 2 || page === 3) {
      let pageNum = 1;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage || pageNum > 7) {
          inRange = false;
        }
      }
    } else if (page === (maxPage - 3)) {
      let pageNum = page - 3;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage || pageNum > page+3) {
          inRange = false;
        }
      }

    } else if (page === (maxPage - 2)) {
      let pageNum = page - 4;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage || pageNum > page+2) {
          inRange = false;
        }
      }
    } else if (page === (maxPage - 1)) {
      let pageNum = page - 5;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage || pageNum > page+1) {
          inRange = false;
        }
      }
    } else if (page === maxPage) {
      let pageNum = page - 6;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage) {
          inRange = false;
        }
      }
    } else {
      let pageNum = page - 3;

      while (inRange) {
        pages.push(
          <Pagination.Item onClick={(e) => changePage(e.target.innerText)} value={pageNum} key={pageNum} active={pageNum === page}>
            {pageNum}
          </Pagination.Item>,
        );

        pageNum++;

        if (pageNum > maxPage || pageNum > page+3) {
          inRange = false;
        }
      }
    }

    // verify current + 3 is not > maxPage

    // verify current - 3 is not < 1

    return pages;
  }

  const changePage = (page) => {
    let page_num = parseInt(page);

    // double validate page !> maxPage or < 0
    if (page > maxPage || page < 1) {
      return;
    }

    // make the search call
    console.log(last_search);
    console.log(last_sort);

    // build search query
    let query = "?";

    if (last_search !== '') {
      query += `s=${last_search}`;
    }
    if (last_long !== '' && last_lat !== '') {
      query += `lat=${last_lat}&long=${last_long}`;
    }
    if (last_sort !== '') {
      if (query !== "?") {
        query += `&sort=${last_sort}`;
      } else {
        query += `sort=${last_sort}`;
      }
    }

    // append the page on no matter what
    if (query === "?") {
      query += `page=${page_num}`;
    } else {
      query += `&page=${page_num}`;
    }
    // searchDatabase([page_num], ["page"]);

    // search
    setIsBusy(true);
    showAll(query).then((temps) => {
      setCityTemps(temps.data);
      setPage(temps.page);
      setMaxPage(temps.last_page);
      setIsBusy(false);
    }).catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => {
    showAll().then((temps) => {
      setCityTemps(temps.data);
      setPage(temps.page);
      setMaxPage(temps.last_page);
      setIsBusy(false);
    }).catch((error) => {
      console.log(error);
      setIsBusy(true);
    });
  }, []);

  return (
    <div className="App">
      { showModal &&
        <ItemModal
          show={showModal}
          onHide={() => setShowModal(false)}
          cityTemp={showCityTemp}
          attemptComment={attemptComment}
        />
      }
      <div className='header-section'>
        <h1>CityTemps Search</h1>
        <Search searchDatabase={searchDatabase} />
      </div>
      { isBusy &&
        <p>loading...</p>
      }
      { (!isBusy && cityTemps !== null ) && 
        <div className="city-temps-results-container">
          { cityTemps === null ? <p>no results</p> :
            cityTemps.map((data) => {
              if (data !== undefined && data.city) {
                return <ItemCard key={`${data.city}-${data.dt}`} cityTemp={data} setShowCityTemp={setShowCityTemp} setShowModal={setShowModal}  />
              }
            })
          }
          { cityTemps !== null &&
            <Pagination>
              <Pagination.First onClick={(e) => changePage(1)} />
              <Pagination.Prev onClick={(e) => changePage(page-1)} />
                { renderPagination() }
              <Pagination.Next onClick={(e) => changePage(+1)} />
              <Pagination.Last onClick={(e) => changePage(maxPage)} />
            </Pagination>
          }
        </div>
      }
    </div>
  );
}

export default App;
