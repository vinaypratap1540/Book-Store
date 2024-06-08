import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';
import book from './bookStore.jpg';
import logo from './bookLogo.png';

const socket = io('https://book-back-end.onrender.com/');

function App() {
  const [data, setData] = useState([]);
  const [bookname, setBookname] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState(0);
  const [id, setId] = useState(0);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    socket.on('initialData', (books) => {
      setData(books);
    });

    socket.on('BookAdded', (book) => {
      setData((prevData) => [...prevData, book]);
    });

    socket.on('BookUpdated', (updatedBook) => {
      setData((prevData) => prevData.map((book) =>
        book.id === updatedBook.id ? updatedBook : book
      ));
    });

    socket.on('BookDeleted', (deletedId) => {
      setData((prevData) => prevData.filter((book) => book.id !== deletedId));
    });

    return () => {
      socket.off('initialData');
      socket.off('BookAdded');
      socket.off('BookUpdated');
      socket.off('BookDeleted');
    };
  }, []);

  const handleEdit = (id) => {
    const dt = data.find(item => item.id === id);
    if (dt) {
      setId(dt.id);
      setUpdate(true);
      setBookname(dt.bookName);
      setAuthor(dt.author);
      setPrice(dt.price);
    }
  };

  const handleDelete = (id) => {
    if (id > 0) {
      if (window.confirm("Are you sure that you want to delete this book?")) {
        fetch(`https://book-back-end.onrender.com//delete-book/${id}`, {
          method: 'DELETE'
        }).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
        }).catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
      }
    }
  };

  const handleSave = () => {
    let error = '';
    if (bookname === '') {
      error += "Book Name is required, ";
    }
    if (author === '') {
      error += "Author Name is required";
    }
    if (price < 0) {
      error += "Please enter a correct Price";
    }
    if (error === '') {
      const newBook = {
        bookName: bookname,
        author: author,
        price: price
      };
      fetch('https://book-back-end.onrender.com//add-book', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      }).finally(() => {
        handleClear();
      });
    } else {
      alert(error);
      handleClear();
    }
  };

  const handleUpdate = () => {
    const updatedBook = {
      bookName: bookname,
      author: author,
      price: price
    };
    fetch(`https://book-back-end.onrender.com//update-book/${id}`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedBook)
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      setData((prevData) => prevData.map((book) =>
        book.id === data.id ? data : book
      ));
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    }).finally(() => {
      handleClear();
    });
  };

  const handleClear = () => {
    setId(0);
    setBookname('');
    setPrice(0);
    setAuthor('');
    setUpdate(false);
  };

  const scrollRef = useRef(null);

  const scrollToSection = () => {
    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      <div className='nav'>
        <h1>Book Store</h1>
        <img src={logo} alt='book' />
        <ul>
          <li>Home</li>
          <li onClick={scrollToSection}>All books</li>
        </ul>
      </div>
      <div className='front'>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>Book Store For You</span>
          <p>BookStore allows you to add and update existing books in real-time. It ensures immediate updates to the book list, providing an interactive user experience.</p>
          <button onClick={scrollToSection} style={{ height: "40px", width: "200px", fontSize: "25px", borderRadius: "0px", marginLeft: "40px", marginTop: "10px" }}>All Books</button>
        </div>
        <img src={book} alt='/' />
      </div>
      <h1>Here is the Book List</h1>
      <div style={{ display: 'flex', justifyContent: "center", alignContent: "center", marginTop: "80px", marginBottom: "30px", gap: "20px" }}>
        <div>
          <label> Book Name :
            <input type='text' placeholder='Enter the Book Name' onChange={(e) => setBookname(e.target.value)} value={bookname}></input>
          </label>
        </div>
        <div>
          <label> Author Name :
            <input type='text' placeholder='Enter the Author Name' onChange={(e) => setAuthor(e.target.value)} value={author}></input>
          </label>
        </div>
        <div>
          <label> Price :
            <input type='number' placeholder='Enter Price of Book' onChange={(e) => setPrice(e.target.value)} value={price}></input>
          </label>
        </div>
        <div>
          {
            !update ?
              <button className='btn' onClick={handleSave}>Save</button>
              :
              <button className='btn' onClick={handleUpdate}>Update</button>
          }
        </div>
      </div>
      <table className='table'>
        <thead>
          <tr>
            <th>Sr.No.</th>
            <th>Book Name</th>
            <th>Author Name</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            data.map((item) => {
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.bookName}</td>
                  <td>{item.author}</td>
                  <td>{item.price}</td>
                  <td>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <footer>
        <div ref={scrollRef} className="footer">
          <div className="row">
            <ul>
              <li>Contact us</li>
              <li>Our Services</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Books</li>
            </ul>
          </div>
          <div className="row">
            VINAY PRATAP © 2024 - All rights reserved || Designed By: VINAY PRATAP SINGH
          </div>
        </div> 
      </footer>
    </div>
  );
}

export default App;

