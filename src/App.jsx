import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { routes } from './routes/routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const renderRoutes = (routes) => {
    return routes.map((route, index) => {
      if (route.children) {
        return (
          <Route key={index} path={route.path} element={<route.component />}>
            {route.children.map((childRoute, childIndex) => (
              <Route
                key={childIndex}
                path={childRoute.path}
                element={<childRoute.component />}
              />
            ))}
          </Route>
        );
      }
      return (
        <Route
          key={index}
          path={route.path}
          element={<route.component />}
        />
      );
    });
  };

  return (
    <>
      <Router>
        <Routes>
          {renderRoutes(routes)}
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#333333',
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '16px',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
          maxWidth: '700px',
          minWidth: '200px',
          fontSize: '16px',
        }}
      />
    </>

  );
}

export default App;