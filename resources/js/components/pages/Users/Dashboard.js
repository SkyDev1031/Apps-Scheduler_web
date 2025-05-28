import moment from "moment";
import { Fragment, useCallback } from "react";
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { useEffect, useState } from "react";
import { IMAGES } from "../../assets";
import { NumberView } from "../../components";
import { useGlobalContext } from "../../contexts";
import { getUsersNumber } from '../../api/OriginAPI.js';
import { toast_error } from "../../utils";

export default function dashboard() {
    const { user, isAdmin, cryptos, setLoading, getInitialData, transactions, holdings } = useGlobalContext();

    const [userNum, setUserNum] = useState(1);
    const [totalUserNum, setTotalUserNum] = useState(1);
    const [packageInfo, setPackageInfo] = useState([]);
    const [selectedToken, setSelectedToken] = useState(0)

    var total_balance = cryptos?.map(item => item.Price * item.balance).reduce((a, b) => a + b, 0) || 0;
    var staked_balance = cryptos?.map(item => item.Price * item.staked_balance).reduce((a, b) => a + b, 0) || 0;

    const _prefix = isAdmin ? '/admin' : '/user';
    useEffect(() => {
        // getInitialData(true);
        // getUserInfo();
    }, [])

    const getUserInfo = useCallback(async () => {
        let res = await getUsersNumber();
        if (res.success) {
            setTotalUserNum(res.data.userTotal);
            setUserNum(res.data.user);
            setPackageInfo(res.data.packageInfo);
        } else {
            toast_error("Invalid Server Connection!");
        }
    }, []);

    const renderTable = (type = 0) => {
        var tmpData = [];
        const isHold = type == 2;
        if (isHold) {
            tmpData = (holdings || [])
                .sort((a, b) => moment(a.DateOfTrans).seconds() - moment(b.DateOfTrans).seconds())
        } else {
            tmpData = (transactions || [])
                .filter(item => item.upcomming == (type == 1))
                .sort((a, b) => moment(a.date).seconds() - moment(b.date).seconds())
        }
        tmpData = tmpData.slice(0, 10);

        return (
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Coin/Type</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tmpData.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row">
                                        <p>
                                            {isHold ? item.type
                                                : item.TransType == 'D' ? 'Deposit'
                                                    : item.TransType == 'W' ? 'Withdraw'
                                                        : item.TransType == 'S' ? 'Send'
                                                            : item.TransType == 'R' ? 'Receive'
                                                                : 'Transfer'
                                            }
                                        </p>
                                        <p className="mdr">{isHold ? '' : moment(item.date).fromNow()}</p>
                                    </th>
                                    <td>
                                        {isHold ?
                                            <p>{moment(item.DateOfTrans).format('ll')}</p>
                                            :
                                            <>
                                                <p>{moment(item.date).format('LT')}</p>
                                                <p className="mdr">{moment(item.date).format('ll')}</p>
                                            </>
                                        }
                                    </td>
                                    <td>
                                        {/* inprogress, completed, pending, cancelled*/}
                                        {isHold ?
                                            <p className="pending">Holding</p>
                                            : item.status == 'P' ?
                                                <p className="pending">Pending</p>
                                                : item.status == 'C' ?
                                                    <p className="completed">Completed</p>
                                                    : item.status == 'A' ?
                                                        <p className="completed">Accepted</p>
                                                        : item.status == 'R' ?
                                                            <p className="cancelled">Returned</p>
                                                            : <p className="cancelled">Cancelled</p>
                                        }
                                    </td>
                                    <td>
                                        <NumberView
                                            size={16}
                                            color={item.plus ? '#49C96D' : '#E9687F'}
                                            prefix={item.plus ? '' : '-'}
                                            decimal={2}
                                            right={5}
                                            value={isHold ? item.Amount : item.amount}
                                            suffix={isHold ? item.cryptoName : item.coin} />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }
    const _price = selectedToken == 1 ? total_balance : selectedToken == 2 ? staked_balance : (total_balance + staked_balance)
    return (
        <>
            <div className="overlay">
                <div className="container-fruid">
                    <div className="row">
                        <div className="col-xl-8 col-lg-7">
                            <div className="section-content">
                                <div className="acc-details">
                                    <div className="top-area">
                                        <div className="left-side">
                                            <h5>Hi, {user?.ScreenName || ''}!</h5>
                                            <br />
                                            <NumberView prefix={"$"} value={total_balance + staked_balance} color={'#fff'} size={40} />
                                            <h5 className="receive">
                                            </h5>
                                        </div>
                                        <div className="right-side">
                                            <div className="right-top">
                                                <Dropdown
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { label: 'Overall', value: 0 },
                                                        { label: 'Wallet', value: 1 },
                                                        { label: 'Staking', value: 2 },
                                                    ]}
                                                    value={selectedToken}
                                                    onChange={(e) => setSelectedToken(e.value)} placeholder="Select a City" />
                                            </div>
                                            <div className="right-bottom mt-2">
                                                <NumberView prefix={"$"} value={_price} color={'#fff'} size={25} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bottom-area">
                                        <div className="left-side">
                                            <a href={`${_prefix}/wallet`} className="cmn-btn">
                                                Transfer Money
                                            </a>
                                            <a href={`${_prefix}/wallet`} className="cmn-btn">
                                                Add Money
                                            </a>
                                            <a href={`${_prefix}/wallet`} className="cmn-btn">
                                                Withdraw
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="transactions-area mt-40">
                                    <div className="section-text">
                                        <h5>Transactions</h5>
                                        <p>Updated every several minutes</p>
                                    </div>
                                    <div className="top-area d-flex align-items-center justify-content-between">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link active"
                                                    id="latest-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#latest"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="latest"
                                                    aria-selected="true"
                                                >
                                                    Latest
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link"
                                                    id="upcoming-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#upcoming"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="upcoming"
                                                    aria-selected="false"
                                                >
                                                    Upcoming
                                                </button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button
                                                    className="nav-link"
                                                    id="holding-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#holding"
                                                    type="button"
                                                    role="tab"
                                                    aria-controls="holding"
                                                    aria-selected="false"
                                                >
                                                    Holding
                                                </button>
                                            </li>
                                        </ul>
                                        <div className="view-all d-flex align-items-center">
                                            <a href={`${_prefix}/logs/deposit-logs`}>View All</a>
                                            <img src={IMAGES.ic_arrow_right} alt="icon" />
                                        </div>
                                    </div>
                                    <div className="tab-content mt-40">
                                        <div
                                            className="tab-pane fade show active"
                                            id="latest"
                                            role="tabpanel"
                                            aria-labelledby="latest-tab"
                                        >
                                            {renderTable(0)}
                                        </div>
                                        <div
                                            className="tab-pane fade"
                                            id="upcoming"
                                            role="tabpanel"
                                            aria-labelledby="upcoming-tab"
                                        >
                                            {renderTable(1)}
                                        </div>
                                        <div
                                            className="tab-pane fade"
                                            id="holding"
                                            role="tabpanel"
                                            aria-labelledby="holding-tab"
                                        >
                                            {renderTable(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-5">
                            <div className="side-items">
                                <div className="single-item">
                                    <div className="section-text d-flex align-items-center justify-content-between">
                                        <h6>Number of users and limit</h6>
                                        <div className="right-side">
                                            <div className="dropdown-area">
                                                <button
                                                    type="button"
                                                    id="dropdownMenuButton1"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                >
                                                    <img src={IMAGES.ic_option} alt="icon" />
                                                </button>
                                                <ul
                                                    className="dropdown-menu"
                                                    aria-labelledby="dropdownMenuButton1"
                                                >
                                                    <li>
                                                        <a className="dropdown-item" href="#">
                                                            Update
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            className="dropdown-item"
                                                            href="#"
                                                        >
                                                            Virtual card
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="single-card">
                                                <h6>Users Status ({userNum}/{totalUserNum})</h6>
                                                {userNum === totalUserNum ? <ProgressBar className="completed" value={(100).toFixed(2)}></ProgressBar>
                                                    : <ProgressBar value={(userNum / totalUserNum * 100).toFixed(2)} ></ProgressBar>
                                                }
                                            </div>
                                        </div>
                                        {
                                            packageInfo !== undefined && packageInfo.length > 0 && <>{packageInfo.map((item, index) => (
                                                <div className="col-6" key={index}>
                                                    <div className="single-card">
                                                        <h6>{item.name} Status ({item.num}/{item.total})</h6>
                                                        {item.num === item.total ? <ProgressBar className="completed" value={(100).toFixed(2)} ></ProgressBar>
                                                            : <ProgressBar value={(item.num / item.total * 100).toFixed(2)} ></ProgressBar>
                                                        }
                                                    </div>
                                                </div>
                                            ))}</>
                                        }
                                    </div>
                                </div>
                                <div className="single-item">
                                    <div className="section-text d-flex align-items-center justify-content-between">
                                        <h6>Governance</h6>
                                        <div className="select-box">
                                            <select>
                                                <option>Monthly</option>
                                                <option value={1}>Jan</option>
                                                <option value={2}>Feb</option>
                                                <option value={3}>Mar</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div id="chart" />
                                </div>
                                <div className="single-item">
                                    <div className="section-text d-flex align-items-center justify-content-between">
                                        <h6>Poll Result</h6>
                                        <div className="view-all d-flex align-items-center">
                                            <a href="#">View All</a>
                                            <img src={IMAGES.ic_arrow_right} alt="icon" />
                                        </div>
                                    </div>
                                    <ul className="recipients-item">
                                        <li>
                                            <p className="left d-flex align-items-center">
                                                <img src={IMAGES.avatar} className="small-img" alt="icon" />
                                                <span className="info">
                                                    <span>Coming Soon</span>
                                                    <span>Date</span>
                                                </span>
                                            </p>
                                            <p className="right">
                                                <span>Result</span>
                                                <span>Pending</span>
                                            </p>
                                        </li>
                                        <li>
                                            <p className="left d-flex align-items-center">
                                                <img src={IMAGES.avatar} className="small-img" alt="icon" />
                                                <span className="info">
                                                    <span>Coming Soon</span>
                                                    <span>Date</span>
                                                </span>
                                            </p>
                                            <p className="right">
                                                <span>Result</span>
                                                <span>Pending</span>
                                            </p>
                                        </li>
                                        <li>
                                            <p className="left d-flex align-items-center">
                                                <img src={IMAGES.avatar} className="small-img" alt="icon" />
                                                <span className="info">
                                                    <span>Coming Soon</span>
                                                    <span>Date</span>
                                                </span>
                                            </p>
                                            <p className="right">
                                                <span>Result</span>
                                                <span>Pending</span>
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <div className="card-popup">
                <div className="container-fruid">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="modal fade" id="cardMod" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header justify-content-center">
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <i className="fa-solid fa-xmark" />
                                            </button>
                                        </div>
                                        <div className="main-content">
                                            <div className="top-area mb-40 mt-40 text-center">
                                                <div className="card-area mb-30">
                                                    <img src={IMAGES.visa} alt="image" />
                                                </div>
                                                <div className="text-area">
                                                    <h5>Apps Scheduler</h5>
                                                    <p>admin panel</p>
                                                </div>
                                            </div>
                                            <div className="tab-area d-flex align-items-center justify-content-between">
                                                <ul className="nav nav-tabs mb-30" role="tablist">
                                                    <li className="nav-item" role="presentation">
                                                        <button
                                                            className="btn-link"
                                                            id="cancel-tab"
                                                            data-bs-toggle="tab"
                                                            data-bs-target="#cancel"
                                                            type="button"
                                                            role="tab"
                                                            aria-controls="cancel"
                                                            aria-selected="false"
                                                        >
                                                            <img src={IMAGES.ic_limit} alt="icon" />
                                                            Set transfer limit
                                                        </button>
                                                    </li>
                                                    <li className="nav-item" role="presentation">
                                                        <button
                                                            className="d-none"
                                                            id="limit-tab"
                                                            data-bs-toggle="tab"
                                                            data-bs-target="#limit"
                                                            type="button"
                                                            role="tab"
                                                            aria-controls="limit"
                                                            aria-selected="true"
                                                        />
                                                    </li>
                                                    <li>
                                                        <button>
                                                            <img src={IMAGES.ic_remove} alt="icon" />
                                                            Remove from Linked
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="tab-content mt-30">
                                                <div
                                                    className="tab-pane fade show active"
                                                    id="limit"
                                                    role="tabpanel"
                                                    aria-labelledby="limit-tab"
                                                >
                                                    <div className="bottom-area">
                                                        <p className="history">
                                                            Transaction History : <span>20</span>
                                                        </p>
                                                        <ul>
                                                            <li>
                                                                <p className="left">
                                                                    <span>03:00 PM</span>
                                                                    <span>17 Oct, 2020</span>
                                                                </p>
                                                                <p className="right">
                                                                    <span>$160.48</span>
                                                                    <span>Withdraw</span>
                                                                </p>
                                                            </li>
                                                            <li>
                                                                <p className="left">
                                                                    <span>01:09 PM</span>
                                                                    <span>15 Oct, 2021</span>
                                                                </p>
                                                                <p className="right">
                                                                    <span>$106.58</span>
                                                                    <span>Withdraw</span>
                                                                </p>
                                                            </li>
                                                            <li>
                                                                <p className="left">
                                                                    <span>04:00 PM</span>
                                                                    <span>12 Oct, 2020</span>
                                                                </p>
                                                                <p className="right">
                                                                    <span>$176.58</span>
                                                                    <span>Withdraw</span>
                                                                </p>
                                                            </li>
                                                            <li>
                                                                <p className="left">
                                                                    <span>06:00 PM</span>
                                                                    <span>25 Oct, 2020</span>
                                                                </p>
                                                                <p className="right">
                                                                    <span>$167.85</span>
                                                                    <span>Withdraw</span>
                                                                </p>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div
                                                    className="tab-pane fade"
                                                    id="cancel"
                                                    role="tabpanel"
                                                    aria-labelledby="cancel-tab"
                                                >
                                                    <div className="main-area">
                                                        <div className="transfer-area">
                                                            <p></p>
                                                            <p className="mdr"></p>
                                                        </div>
                                                        <form action="#">
                                                            <div className="input-area">
                                                                <input
                                                                    className="xxlr"
                                                                    placeholder={400.0}
                                                                    type="number"
                                                                />
                                                                <select>
                                                                    <option value={1}>USD</option>
                                                                    <option value={2}>USD</option>
                                                                    <option value={3}>USD</option>
                                                                </select>
                                                            </div>
                                                            <div className="bottom-area d-flex align-items-center justify-content-between">
                                                                <a
                                                                    href="#"
                                                                    className="cmn-btn cancel"
                                                                >
                                                                    Cancel and Back
                                                                </a>
                                                                <a href="#" className="cmn-btn">
                                                                    Confirm Transfer Limit
                                                                </a>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="add-card">
                <div className="container-fruid">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="modal fade" id="addcardMod" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header justify-content-between">
                                            <h6>Add Card</h6>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <i className="fa-solid fa-xmark" />
                                            </button>
                                        </div>
                                        <form action="#">
                                            <div className="row justify-content-center">
                                                <div className="col-md-12">
                                                    <div className="single-input">
                                                        <label htmlFor="cardNumber">Card Number</label>
                                                        <input
                                                            type="text"
                                                            id="cardNumber"
                                                            placeholder="5890 - 6858 - 6332 - 9843"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="single-input">
                                                        <label htmlFor="cardHolder">Card Holder</label>
                                                        <input
                                                            type="text"
                                                            id="cardHolder"
                                                            placeholder="Alfred Davis"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="single-input">
                                                        <label htmlFor="month">Month</label>
                                                        <input type="text" id="month" placeholder={12} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="single-input">
                                                        <label htmlFor="year">Year</label>
                                                        <input type="text" id="year" placeholder={2025} />
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <div className="btn-border w-100">
                                                        <button className="cmn-btn w-100">Add Card</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="transactions-popup">
                <div className="container-fruid">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="modal fade" id="transactionsMod" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header justify-content-between">
                                            <h5>Transaction Details</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <i className="fa-solid fa-xmark" />
                                            </button>
                                        </div>
                                        <div className="main-content">
                                            <div className="row">
                                                <div className="col-sm-5 text-center">
                                                    <div className="icon-area">
                                                        <img
                                                            src={IMAGES.ic_ts_detail}
                                                            alt="icon"
                                                        />
                                                    </div>
                                                    <div className="text-area">
                                                        <h6>Envato Pty Ltd</h6>
                                                        <p>16 Jan 2022</p>
                                                        <h3>717.14 USD</h3>
                                                        <p className="com">Completed</p>
                                                    </div>
                                                </div>
                                                <div className="col-sm-7">
                                                    <div className="right-area">
                                                        <h6>Transaction Details</h6>
                                                        <ul className="payment-details">
                                                            <li>
                                                                <span>Payment Amount</span>
                                                                <span>718.64 USD</span>
                                                            </li>
                                                            <li>
                                                                <span>Fee</span>
                                                                <span>1.50 USD</span>
                                                            </li>
                                                            <li>
                                                                <span>Total Amount</span>
                                                                <span>717.14 USD</span>
                                                            </li>
                                                        </ul>
                                                        <ul className="payment-info">
                                                            <li>
                                                                <p>Payment From</p>
                                                                <span className="mdr">Envato Pty Ltd</span>
                                                            </li>
                                                            <li>
                                                                <p>Payment Description</p>
                                                                <span className="mdr">
                                                                    Envato Feb 2022 Member Payment
                                                                </span>
                                                            </li>
                                                            <li>
                                                                <p>Transaction ID:</p>
                                                                <span className="mdr">
                                                                    6559595979565959895559595
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}