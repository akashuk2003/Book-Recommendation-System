import React, { useState, useEffect, createContext, useContext } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = {
  async get(endpoint, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  async post(endpoint, body, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok && response.status !== 400) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};


const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const data = await api.post('/login/', { username, password });
      if (data.access) {
        setToken(data.access);
        return { success: true };
      }
      return { success: false, message: data.detail || "Login failed." };
    } catch (error) {
      return { success: false, message: "Please check your login Credentials" };
    }
  };

  const register = async (userData) => {
     try {
      const data = await api.post('/register/', userData);
      if (data.username) {
        return { success: true };
      }
      return { success: false, message: JSON.stringify(data) };
    } catch (error) {
      return { success: false, message: "An error occurred." };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const authValue = { token, user, login, logout, register };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);



const BookCard = ({ book, onAction, isBorrowed }) => {
  const { token } = useAuth();
  const handleBorrow = () => onAction('borrow', book.id);
  const handleReturn = () => onAction('return', book.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{book.title}</h3>
        <p className="text-gray-600 mb-1">by {book.author}</p>
        <p className="text-sm text-gray-500 mb-4">{book.genre}</p>
        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${book.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {book.is_available ? 'Available' : 'Borrowed'}
          </span>
          <span className="text-sm text-gray-500">Read {book.read_count} times</span>
        </div>
        {token && (
          <div className="pt-4 border-t border-gray-200">
            {isBorrowed ? (
              <button onClick={handleReturn} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300">
                Return Book
              </button>
            ) : (
              <button onClick={handleBorrow} disabled={!book.is_available} className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${!book.is_available ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                Borrow Book
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Modal = ({ message, onClose, isError }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full text-center">
        <p className={`text-lg ${isError ? 'text-red-600' : 'text-gray-800'}`}>{message}</p>
        <button onClick={onClose} className="mt-6 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          Close
        </button>
      </div>
    </div>
  );
};

const Spinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);



const LoginPage = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message || 'Failed to login.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign In</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button type="submit" className="w-full py-2 px-4 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Login</button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <button onClick={() => onSwitch('register')} className="font-medium text-blue-600 hover:underline">Register</button>
        </p>
      </div>
    </div>
  );
};

const RegisterPage = ({ onSwitch }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const result = await register({ username, password, email });
        if (result.success) {
            setSuccess('Registration successful! Please login.');
            setTimeout(() => onSwitch('login'), 2000);
        } else {
            setError(result.message || 'Registration failed.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {success && <p className="text-green-500 text-center">{success}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full py-2 px-4 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Register</button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    Already have an account? <button onClick={() => onSwitch('login')} className="font-medium text-blue-600 hover:underline">Sign In</button>
                </p>
            </div>
        </div>
    );
};

const BookListPage = ({ borrowedBookIds, handleAction }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ author__name: '', genre__name: '', is_available: '' });
  const { token } = useAuth();

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))).toString();
      const data = await api.get(`/books/?${query}`, token);
      setBooks(data.results || data);
    } catch (err) {
      setError('Failed to fetch books.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBooks();
  }, [token, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Browse All Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <input type="text" name="author__name" placeholder="Filter by author..." value={filters.author__name} onChange={handleFilterChange} className="p-2 border rounded-md" />
        <input type="text" name="genre__name" placeholder="Filter by genre..." value={filters.genre__name} onChange={handleFilterChange} className="p-2 border rounded-md" />
        <select name="is_available" value={filters.is_available} onChange={handleFilterChange} className="p-2 border rounded-md bg-white">
          <option value="">All Statuses</option>
          <option value="true">Available</option>
          <option value="false">Borrowed</option>
        </select>
      </div>
      {loading && <Spinner />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map(book => (
            <BookCard key={book.id} book={book} onAction={handleAction} isBorrowed={borrowedBookIds.includes(book.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

const MyBooksPage = ({ borrowedBooks, handleAction }) => (
  <div>
    <h2 className="text-3xl font-bold text-gray-800 mb-6">My Borrowed Books</h2>
    {borrowedBooks.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {borrowedBooks.map(borrowed => (
          <BookCard key={borrowed.book.id} book={borrowed.book} onAction={handleAction} isBorrowed={true} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">You have not borrowed any books yet.</p>
    )}
  </div>
);

const RecommendationsPage = ({ handleAction, borrowedBookIds }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.get('/recommendations/', token);
        setBooks(data.results || data);
      } catch (err) {
        setError('Failed to fetch recommendations.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRecs();
  }, [token]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Recommended For You</h2>
      {loading && <Spinner />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && books.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {books.map(book => (
            <BookCard key={book.id} book={book} onAction={handleAction} isBorrowed={borrowedBookIds.includes(book.id)} />
          ))}
        </div>
      ) : (
        !loading && <p className="text-gray-600">No recommendations available. Try borrowing some books first!</p>
      )}
    </div>
  );
};


const AppContent = () => {
  const [activePage, setActivePage] = useState('books');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [modal, setModal] = useState({ message: '', isError: false });
  const { token, logout } = useAuth();

  const fetchBorrowedBooks = async () => {
    if (!token) return;
    try {
      const data = await api.get('/my-borrowed-books/', token);
      setBorrowedBooks(data.results || data);
    } catch (error) {
      console.error("Failed to fetch borrowed books:", error);
      setBorrowedBooks([]);
    }
  };
  
  useEffect(() => {
    fetchBorrowedBooks();
  }, [token]);

  const handleAction = async (action, bookId) => {
    try {
      const result = await api.post(`/books/${bookId}/${action}/`, {}, token);
      if (result.message) {
        setModal({ message: result.message, isError: false });
        fetchBorrowedBooks();
      } else {
        setModal({ message: result.error || `Failed to ${action} book.`, isError: true });
      }
    } catch (error) {
      setModal({ message: `An error occurred during the ${action} action.`, isError: true });
    }
  };

  const borrowedBookIds = borrowedBooks.map(b => b.book.id);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Modal message={modal.message} isError={modal.isError} onClose={() => setModal({ message: '', isError: false })} />
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Book Lending System</h1>
          <div>
            <button onClick={() => setActivePage('books')} className={`px-4 py-2 ${activePage === 'books' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>Browse</button>
            <button onClick={() => setActivePage('my-books')} className={`px-4 py-2 ${activePage === 'my-books' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>My Books</button>
            <button onClick={() => setActivePage('recommendations')} className={`px-4 py-2 ${activePage === 'recommendations' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>Recommendations</button>
            <button onClick={logout} className="ml-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">Logout</button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">
        {activePage === 'books' && <BookListPage borrowedBookIds={borrowedBookIds} handleAction={handleAction} />}
        {activePage === 'my-books' && <MyBooksPage borrowedBooks={borrowedBooks} handleAction={handleAction} />}
        {activePage === 'recommendations' && <RecommendationsPage borrowedBookIds={borrowedBookIds} handleAction={handleAction} />}
      </main>
    </div>
  );
};

export default function App() {
  const [authPage, setAuthPage] = useState('login');

  return (
    <AuthProvider>
      <AuthConsumer>
        {({ token }) => token ? <AppContent /> : (
          authPage === 'login' ? <LoginPage onSwitch={setAuthPage} /> : <RegisterPage onSwitch={setAuthPage} />
        )}
      </AuthConsumer>
    </AuthProvider>
  );
}

const AuthConsumer = ({ children }) => {
    const auth = useAuth();
    return children(auth);
}
