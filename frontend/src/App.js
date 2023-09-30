import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import { PrivateRoute } from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import NewTicket from './pages/NewTicket'
import Register from './pages/Register'
import Tickets from './pages/Tickets'
import Ticket from './pages/Ticket'
import ListTickets from './pages/ListTickets'
import Dashboard from './pages/Dashboard'
import IssueTypeList from './pages/issues'
import IssueTypeid from './pages/issueaction'
import UpdateTicket from './pages/updateTicket.jsx'
import TicketHistory from './pages/ticketHistory'
import New from './pages/new'

function App () {
  return (
    <>
      <Router>
        <div className='container'>
          <Header />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/new-ticket' element={<PrivateRoute />}>
              <Route path='/new-ticket' element={<NewTicket />} />
            </Route>
            <Route path='/tickets' element={<PrivateRoute />}>
              <Route path='/tickets' element={<Tickets />} />
            </Route>
            <Route path='/ticket/:ticketId' element={<PrivateRoute />}>
              <Route path='/ticket/:ticketId' element={<Ticket />} />
            </Route>
            <Route path='/allticket' element={<PrivateRoute />}>
              <Route path='/allticket' element={<ListTickets />} />
            </Route>
            <Route path='/dashboard' element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
            </Route>
            <Route path='/issues' element={<PrivateRoute />}>
              <Route path='/issues' element={<IssueTypeList />} />
            </Route>
            <Route path='/issues/:id' element={<PrivateRoute />}>
              <Route path='/issues/:id' element={<IssueTypeid />} />
            </Route>
            <Route path='/ticket/:ticketId/update' element={<PrivateRoute />}>
              <Route path='/ticket/:ticketId/update' element={<UpdateTicket />} />
            </Route>
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App