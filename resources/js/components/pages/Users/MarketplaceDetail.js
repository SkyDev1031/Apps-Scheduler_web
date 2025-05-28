import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, MenuItem, Rating, Select, TextField } from '@mui/material';
import moment from "moment";
import path from 'path';
import { Button } from 'primereact/button';
import { useCallback, useEffect, useState } from "react";
import Carousel from 'react-bootstrap/Carousel';
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { useNavigate, useParams } from "react-router-dom";
import { buyProductApi, productApi } from '../../api/OriginAPI.js';
import { IMAGES } from '../../assets';
import { Image, NumberView } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from "../../contexts";
import { getProdFiles, marketplace_path, tempfiles_path, toast_error, toast_success, upload_path } from "../../utils";
import { default as Chat } from "../Chat/pop_chat";
import { FiX } from 'react-icons/fi';
import { useChatContext } from '../../Chat';
import { getSupportCreditsApi } from '../../api/OriginAPI.js';

var stylingObject = {
    div: {
        position:"fixed", 
        bottom:10, 
        right:15,
        zIndex:1300,
        boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.3), 0 6px 25px 0 rgba(0, 0, 0, 0.3)'
    }, 
    input: {
      margin: "2px",
      padding: "5px"
    }
  }
const MarketplaceDetail = (props) => {
    const { id } = useParams();
    const isBuy = props.buy;
    const isDownload = props.download;

    const { isLoading, setLoading, cryptos, settings, getInitialData, click_count, setClickCount, sellerId, setSellerId, user, buy_credits, setBuyCredits } = useGlobalContext();
    const navigate = useNavigate();
    const {
        refreshChatList
    } = useChatContext()

    const [selectedItem, setSelectedItem] = useState({});
    const [shipCountries, setShipCountries] = useState("");
    const [buyDetails, setBuyDetails] = useState({ visible: false })
    const [supportDetails, setSupportDetails] = useState({ visible: false })

    const [country, setCountry] = useState("");
    const [region, setRegion] = useState("");
    const [supportCredits, setSupportCredits] = useState(0);
    const [star_value, setStarValue] = useState(0);

    useEffect(() => {
        getData();
        setClickCount(0);
        setSellerId(0);
        setBuyCredits(false);
        getSupportCredits();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await productApi(id);
            setSelectedItem(res.marketplace || {});

            if (res.marketplace.ShipCountries === null || res.marketplace.ShipCountries === "[]" || res.marketplace.ShipCountries.length === 0) {
                setShipCountries("Available in every countries!");
            } else {
                let countries = "";
                res.marketplace.ShipCountries.forEach(country => {
                    countries = countries + country.label + ", ";
                });
                setShipCountries(countries.slice(0, -2));
            }
            await refreshChatList();
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR)
        } finally {
            setLoading(false);
        }
    }, [selectedItem])
    const typeOfItem = {
        'Physical': 'Physical', 'DigitalBuyNow': 'Digital Buy Now', '7Days': '7 Days Access', '30Days': '30 Days Access'
    }
    const getSupportCredits = useCallback(async () => {
        try {
            if(id){
                const data = {
                    product_id: id,
                };
                const res = await getSupportCreditsApi(data);
                setSupportCredits(parseFloat(res.amount).toFixed(4));
            }
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR)
        } finally {
        }
    }, [supportCredits])
    const getRating = () => {
        try {
            const ratings = selectedItem?.rating || [];
            const avg = ratings.map(item => item.Rating).reduce((a, b) => a + b) / ratings?.length;
            return avg || 0;
        } catch (error) {
        }
        return 0;
    }
    const renderDownloadFiles = () => {
        return getProdFiles(selectedItem)
            .map((item, index) => {
                const ext = path.extname(item.file).toLowerCase();
                const icon = ext == '.pdf' ? IMAGES.ic_pdf : IMAGES.ic_word;
                return (
                    <div className='download-item' key={index}>
                        <div>
                            <Image src={icon} def={IMAGES.ic_pdf} />
                            <div>{`${path.basename(item.file)}`}</div>
                        </div>
                        <a className='cmn-btn' href={tempfiles_path(item.file)} download>Download</a>
                    </div>
                )
            })
    }
    const updateBuyDetails = (item) => setBuyDetails(bef => ({ ...bef, ...item }));
    const updateSupportDetails = () => {
        setClickCount(click_count+1);
        if(!isBuy) setClickCount(click_count+2);
        if(selectedItem.UserID==user.id) setClickCount(click_count+2);
        setSellerId(selectedItem);
        if(supportCredits>1){
            setBuyCredits(true);
        }
        setSupportDetails(bef => ({ ...bef, visible: true }))
    };

    const handleClose = () => {
        setBuyDetails({});
    };
    const _handleClose = () => {
        setSupportDetails({});
    };

    const _crypto = cryptos?.find(item => item.id == buyDetails?.cryptoId) || {};
    const _price = (selectedItem.Price + (selectedItem?.Price * settings?.BuyersFee) / 100) || 0;
    const _crypto_price = _price / _crypto.Price

    const handleAction = async (e) => {
        e?.preventDefault?.();
        // await getInitialData();
        if (!buyDetails.cryptoId) return toast_error("Please choose the crypto", _ERROR_CODES.INVALID_INPUT);
        if (!(_crypto.Price > 0)) return toast_error(`You are not available to use ${_crypto.CryptoName || 'Crypto'}. Please contract support.`, _ERROR_CODES.NO_PRICE);
        if (_crypto_price > _crypto.balance) return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE);
        if (!buyDetails.name) return toast_error("Please enter your name", _ERROR_CODES.INVALID_INPUT);
        if (!buyDetails.address) return toast_error("Please enter address", _ERROR_CODES.INVALID_INPUT);
        if (!buyDetails.city) return toast_error("Please enter city", _ERROR_CODES.INVALID_INPUT);
        if (!buyDetails.country) return toast_error("Please select country", _ERROR_CODES.INVALID_INPUT);
        if (!shipCountries.includes(buyDetails.country)) return toast_error("Please select available country", _ERROR_CODES.INVALID_INPUT);
        if (!buyDetails.state) return toast_error("Please select state", _ERROR_CODES.INVALID_INPUT);
        if (!buyDetails.zip) return toast_error("Please enter the zip code", _ERROR_CODES.INVALID_INPUT);
        setLoading(true)
        const _data = {
            cryptoId: buyDetails.cryptoId,
            cryptoPrice: _crypto_price,
            buyerName: buyDetails.name,
            address: buyDetails.address,
            city: buyDetails.city,
            state: buyDetails.state,
            country: buyDetails.country,
            zip: buyDetails.zip,
            productId: selectedItem.id,
        }
        const res = await buyProductApi(_data).catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            navigate('/user/marketplace');
        }
        setLoading(false);
    }

    if (isLoading) return <></>

    return (
        <div className="marketplace-container">
            <section className="latest-articles posts blog-4">
                <div className="overlay pb-120">
                    <div className="container" style={{ position: "relative" }}>
                        <h4 className="title mt-30">{isDownload ? 'Download' : "Details"} [{selectedItem.TypeOfItem == 'Physical' ? 'Physical Item' : 'Digital Item'}]</h4>
                        <div className="row marketplace-detail-item mt-30">
                            <div className="col-lg-6">
                                <Carousel variant="dark">
                                    <Carousel.Item>
                                        <Image src={marketplace_path(selectedItem.Image1)} def={DEF_IMAGE.marketplace} />
                                    </Carousel.Item>
                                    {selectedItem.Image2 &&
                                        <Carousel.Item>
                                            <Image src={marketplace_path(selectedItem.Image2)} def={DEF_IMAGE.marketplace} />
                                        </Carousel.Item>
                                    }
                                    {selectedItem.Image3 &&
                                        <Carousel.Item>
                                            <Image src={marketplace_path(selectedItem.Image3)} def={DEF_IMAGE.marketplace} />
                                        </Carousel.Item>
                                    }
                                </Carousel>
                            </div>
                            <div className="col-lg-6">
                                <h4 className="success-text">{selectedItem.ProductName}</h4>
                                <div className="description">{selectedItem.Description}</div>
                                <br />
                                <div className="d-flex">
                                    <span className="gray-bold">Seller: </span><b>{selectedItem.user?.ScreenName}</b>
                                    <Rating name="half-rating-read" className={'ratingbar'} value={getRating()} precision={0.1} readOnly />
                                    ({selectedItem.rating?.length || 'No'} ratings)
                                </div>
                                <div className="d-flex">
                                    <span className="gray-bold">Product Type: </span>
                                    <span className="success-text"><b>{typeOfItem[selectedItem.TypeOfItem]}</b></span>
                                </div>
                                <div className="d-flex">
                                    <span className="gray-bold">Price: </span>
                                    <NumberView value={selectedItem.Price} decimal={2} prefix={'$'} color={"#00a654"} bold />
                                </div>
                                <div className="d-flex">
                                    <span className="gray-bold">Shipping : </span>
                                    <span className="success-text"><b>{selectedItem.Ship_On === "Y" ? "On" : "Off"}</b></span>
                                </div>
                                <div className="d-flex">
                                    <span className="gray-bold">Buy Support Credits: </span>
                                    <NumberView value={selectedItem.BuyCredits} decimal={2} prefix={'$'} color={"#00a654"} bold />
                                </div>
                                <div className="d-flex">
                                    <span className="warning-text">
                                        <b>Only {selectedItem.Quantity} left in stock</b>
                                    </span>
                                </div>
                                {isBuy && <button className="cmn-btn" onClick={() => updateBuyDetails({ visible: true })} > Buy Now</button>}
                                {isBuy && (selectedItem.UserID!=user.id) && <button className="cmn-btn ml-10px bg-green-but" onClick={updateSupportDetails} > Support</button>}
                                {isDownload && <div className='download-file-container'>{renderDownloadFiles()}</div>}
                            </div>
                            {!isBuy && <div className="col-lg-12 mt-30">
                                    <h5><b>FAQ</b></h5>
                                    <hr />
                                    {selectedItem?.faq?.map((item, index) => (
                                        <div key={index}>
                                            <div className="byer-feedback">
                                                {index+1}. {item.question}
                                                <br></br>
                                                &nbsp;&nbsp;&nbsp;&nbsp;{item.answer}
                                                {/* <div className="d-flex">
                                                    {moment(item.created_at).format('lll')}
                                                </div> */}
                                            </div>
                                            <hr />
                                        </div>
                                    ))}
                                </div>
                            }
                                
                            {/* <div className="col-lg-12 mt-30">
                                <h5><b>Byer Feedback</b></h5>
                                <hr />
                                {selectedItem?.rating?.map((item, index) => (
                                    <div key={index}>
                                        <div className="byer-feedback">
                                            <div className="d-flex">
                                                <Rating name="half-rating" className={'ratingbar'} defaultValue={item.Rating} precision={0.5} readOnly />
                                                {moment(item.DateTime).format('lll')}
                                            </div>
                                            {item.Comments}
                                        </div>
                                        <hr />
                                    </div>
                                ))}
                            </div> */}
                            {(supportCredits>1) && <div className="col-lg-12 mt-30">
                                <h5><b>Feedback On Moderator</b></h5>
                                <hr />
                                {/* <Rating
                                name="simple-controlled"
                                value={value}
                                onChange={(event, newValue) => {
                                    setValue(newValue);
                                }}
                                /> */}
                                <div className="d-flex">
                                    <Rating name="half-rating" className={'ratingbar'} value={star_value} precision={0.5} onChange={(event, newValue) => {setStarValue(newValue);}}/>
                                    <button className="cmn-btn" style={{padding: 0, paddingLeft: 5, paddingRight: 5}}> save</button>
                                </div>
                            </div>}
                        </div>
                    </div>
                </div>
            </section>
            <Dialog
                open={buyDetails.visible || false}
                onClose={handleClose}
                scroll={'paper'}
                maxWidth={'md'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" className='pt-30' style={{fontSize: "32px"}}>
                    {`Buy product #${selectedItem.id}`}
                </DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <Grid container spacing={3} className={'p-20'}>
                        <Grid xs={12} md={5} className={'pt-20'}>
                            <h5>{selectedItem.ProductName}</h5>
                            <hr />
                            <div className='product-detail-item'>
                                <span className='label'>Price:</span>
                                <NumberView value={selectedItem.Price} decimal={2} prefix={'$'} bold color={"#00a654"} />
                            </div>
                            <div className='product-detail-item'>
                                <span className='label'>Fee:</span>
                                <NumberView value={settings.BuyersFee} decimal={2} suffix={'%'} bold color={"#00a654"} />
                            </div>
                            <div className='product-detail-item'>
                                <span className='label'>Total:</span>
                                <NumberView value={_price} decimal={2} prefix={'$'} color={"#00a654"} bold />
                            </div>
                            <hr />
                            {selectedItem.Ship_On === "Y" && <>
                                <div className="product-detail-item">
                                    <span className="label">Shipping:</span>
                                    <span className="success-text"><b>{selectedItem.Ship_On === "Y" ? "On" : "Off"}</b></span>
                                </div>
                                <div className="product-detail-item d-flex">
                                    <span className="label">Available Countries:</span>
                                    <span className="success-text"><b>{shipCountries}</b></span>
                                </div>
                            </>
                            }
                            <FormControl fullWidth>
                                <Select
                                    className="crypto-selector-img"
                                    value={buyDetails.cryptoId || 0}
                                    onChange={e => updateBuyDetails({ cryptoId: e.target.value })}
                                    inputProps={{
                                        className: "crypto-selector-img"
                                    }}>
                                    <MenuItem value={0} key={0} disabled>
                                        <div style={{ padding: 12 }}>Pay with</div>
                                    </MenuItem>
                                    {cryptos?.map((crypto, cIndex) => (
                                        <MenuItem value={crypto.id} key={cIndex}>
                                            <Image
                                                className={'selector-img'}
                                                src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                            <span>{crypto.CryptoName} - {(crypto.balance || 0).toFixed(4)}</span>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {buyDetails.cryptoId &&
                                <div className='product-detail-item'>
                                    {!(_crypto.Price > 0) ?
                                        <div className={`mt-4 error-text`}>
                                            {`You are not available to use ${_crypto.CryptoName || 'Crypto'} for now. Please contract support with error code #${_ERROR_CODES.NO_PRICE}`}
                                        </div>
                                        :
                                        <>
                                            <NumberView value={_crypto_price} decimal={5} suffix={` ${_crypto.CryptoName}`} color={"#00a654"} bold />
                                        </>
                                    }
                                </div>
                            }
                        </Grid>
                        <Grid xs={12} md={7} className={'pt-20'}>
                            <h5>Enter your delivery Address:</h5>
                            <hr />
                            <FormControl fullWidth className={'pt-20'}>
                                <TextField id="outlined-basic" label="Name" required variant="outlined"
                                    defaultValue={buyDetails.name || ''}
                                    onChange={e => buyDetails.name = e.target.value} />
                            </FormControl>
                            <FormControl fullWidth className={'pt-20'}>
                                <TextField id="outlined-basic" label="Address" required variant="outlined"
                                    defaultValue={buyDetails.address || ''}
                                    onChange={e => buyDetails.address = e.target.value} />
                            </FormControl>
                            <FormControl fullWidth className={'pt-20'}>
                                <TextField id="outlined-basic" label="City" required variant="outlined"
                                    defaultValue={buyDetails.city || ''}
                                    onChange={e => buyDetails.city = e.target.value} />
                            </FormControl>
                            <FormControl fullWidth className={'pt-20'}>
                                <TextField id="outlined-basic" label="Zip" required variant="outlined" type="number"
                                    defaultValue={buyDetails.zip || ''}
                                    onChange={e => buyDetails.zip = e.target.value} />
                            </FormControl>
                            <FormControl fullWidth className={'pt-20'}>
                                <CountryDropdown
                                    className="font-weight-bold w-100 m-auto form-select rounded h-45px text-gray" required
                                    value={country}
                                    onChange={(val) => { setCountry(val); buyDetails.country = val }}
                                />
                            </FormControl>
                            <FormControl fullWidth className={'pt-20'}>
                                
                                <RegionDropdown
                                    className="font-weight-bold w-100 m-auto form-select rounded h-45px text-gray" required
                                    country={country}
                                    value={region}
                                    onChange={(val) => { setRegion(val); buyDetails.state = val }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
            {supportDetails.visible && <div style={stylingObject.div}>
                <div>
                    <div className='close' style={{color:"black"}} onClick={_handleClose}><FiX size={28} style={{float:"right"}} /></div>
                    <Chat />
                </div>
            </div>}
            {!supportDetails.visible && <a className="scrollToTop active" onClick={updateSupportDetails}><i className="fas fa-angle-double-up"></i>
            </a>
            }
            {/* <Dialog
                open={supportDetails.visible || false}
                onClose={_handleClose}
                scroll={'paper'}
                maxWidth={'md'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <div className='close' style={{color:"black"}} onClick={_handleClose}><FiX size={28} style={{float:"right"}} /></div>
                <Chat />
            </Dialog> */}
        </div>
    )
}
export default MarketplaceDetail;