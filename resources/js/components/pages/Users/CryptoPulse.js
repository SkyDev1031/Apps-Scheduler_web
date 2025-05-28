import { MenuItem, Select, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from "react";
import { Col, Row } from 'react-bootstrap';
import { coinPulsesApi, deleteCoinPulsesApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from "../../contexts";
import { toast_error } from '../../utils';


const CryptoPulse = ({ type }) => {

    const [coinPulses, setCoinPulses] = useState([])
    const { setLoading, confirmDialog } = useGlobalContext();
    const [query, setQuery] = useState();

    const [selectedDis, setSelectedDis] = useState({ id: "0", Description: "" });
    const [activeDiscussions, setActiveDiscussions] = useState([]);

    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true);
        coinPulsesApi(type)
            .then(res => {
                setCoinPulses(res.data);
                setActiveDiscussions(res.discussions);
            })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }, [coinPulses])

    const updateSelectedDis = (id) => {
        activeDiscussions.forEach((discussion) => {
            if (discussion.id === id) {
                setSelectedDis(discussion);
            }
        });
    }

    const deleteItem = async (item) => {
        const isDelete = await confirmDialog();
        if (!isDelete) return;
        const res = await deleteCoinPulsesApi(item.id)
        if (res?.success) {
            toast_success(res?.message)
            getPulses(false)
        }
    }

    return (
        <div className='packages-container'>
            <Row className="m-0">
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Group Discussions</h6>
                        </div>
                        <div className="row m-0">
                            <Select
                                className="crypto-selector-img"
                                value={selectedDis.id || "0"}
                                onChange={e => { updateSelectedDis(e.target.value) }}
                                inputProps={{
                                    className: "crypto-selector-img"
                                }}>
                                <MenuItem value={0} key={0} disabled>
                                    <div>Select Discussion</div>
                                </MenuItem>
                                {activeDiscussions?.map((discussion, cIndex) => (
                                    <MenuItem value={discussion.id} key={cIndex}>
                                        <div> {discussion.Title}</div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>
                        <div className="row m-0 discussionTextField">
                            <TextField
                                disabled
                                // id="outlined-multiline-static"
                                value={selectedDis.Description}
                                variant="outlined"
                                size="small"
                                multiline={true}
                                rows={2}
                                inputProps={{
                                    style: {
                                        height: "135px",
                                        padding: "0px",
                                    },
                                }}
                            />
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Indicators</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Sentiment</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Liquidity</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="m-0">
                <Col lg="4" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Wallet Tracker</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="4" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Open/Closed/Trades</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="4" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Bot</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row className="m-0">
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Social media</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Trending</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Discussions</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
                <Col lg="3" md="6" sm="12" xs="12" className="p-2 card-height">
                    <div className="m-0 bg-gray-card rounded p-2 card-scroll h-100">
                        <div className="row m-0">
                            <h6 className="title mb-0 text-center">Messenger</h6>
                        </div>
                        <div className="row m-0">
                            <h6 className="">Coming Soon!</h6>
                        </div>
                    </div>
                </Col>
            </Row>
        </div >
    )
};

export default CryptoPulse;