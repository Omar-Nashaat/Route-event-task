import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import style from './Home.module.css';
import loading from '../../assets/loadingAnimation.json';
import Lottie from 'lottie-react';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
    const [customers, setCustomers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const getData = () => {
        // This api is the result of Setting up a local server to host the JSON data on (jsonbin.io site).
        axios.get(`https://api.jsonbin.io/v3/b/66908c06e41b4d34e410942b`, {
            headers: {
                'X-Master-Key': '$2a$10$mgNuqrjFX0CLTPi0D1U4U.OXHPluzTsR/cfnl..HYWDtI3hViqXmS',
                'Y-Master-Key': '$2a$10$9OkPe7Vnx2ZiDg5s/ggF1u6unUINKCxBBmHHqTxhEwhYZPXtFBN2u'
            }
        })
            .then((res) => {
                setCustomers(res.data.record.customers || []);
                setTransactions(res.data.record.transactions || []);
                setIsLoading(false);
            }).catch((err) => {
                console.log(err);
                setIsLoading(false);
            });
    }

    useEffect(() => {
        getData();
    }, []);

    const getTotalTransactionAmount = (customerId) => {
        return transactions
            .filter(transaction => transaction.customer_id === customerId)
            .reduce((total, transaction) => total + transaction.amount, 0);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewGraph = (customer) => {
        setSelectedCustomer(customer);
        setShowModal(true);
    };

    const getTransactionDataForCustomer = (customerId) => {
        const customerTransactions = transactions.filter(transaction => transaction.customer_id === customerId);
        const transactionData = customerTransactions.reduce((acc, transaction) => {
            acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
            return acc;
        }, {});

        const labels = Object.keys(transactionData).sort();
        const data = labels.map(date => transactionData[date]);

        return {
            labels,
            datasets: [
                {
                    label: 'Transaction Amount',
                    data,
                    fill: false,
                    borderColor: 'rgba(75,192,192,1)',
                    tension: 0.1
                }
            ]
        };
    };

    return (
        <div className="container">
            <div className='searchBar'>
                <div className="input-group mb-5 mt-4 w-75 m-auto">
                    <span className={style.searchBg + " input-group-text p-2"}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input 
                        type="text" 
                        className={style.searchBg + " form-control"} 
                        placeholder='Search by customer name ..' 
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            {isLoading ? (
                <div className='d-flex flex-column align-items-center'>
                    <div className="col-md-5 col-12">
                        <div className='text-center'>
                            <Lottie animationData={loading}></Lottie>
                        </div>
                    </div>
                </div>
            ) : (
                customers.length > 0 && transactions.length > 0 ? (
                    <table className="table table-striped table-hover text-center">
                        <thead className="table-primary">
                            <tr>
                                <th scope="col">Customer ID</th>
                                <th scope="col">Customer Name</th>
                                <th scope="col">Total Transactions Amount</th>
                                <th scope="col">Transactions amount per day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <th scope="row">{customer.id}</th>
                                    <td>{customer.name}</td>
                                    <td>{getTotalTransactionAmount(customer.id)}</td>
                                    <td><button className='btn btn-primary' onClick={() => handleViewGraph(customer)}>View Graph</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data available.</p>
                )
            )}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Transaction Amount Per Day</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCustomer && (
                        <Line data={getTransactionDataForCustomer(selectedCustomer.id)} />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
