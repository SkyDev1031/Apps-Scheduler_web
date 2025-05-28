import { Button, FormControl, FormControlLabel, FormLabel, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, Stack, Switch, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { trim } from 'lodash';
import { useCallback, useEffect, useRef, useState } from "react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { useNavigate, useParams } from "react-router-dom";
import ReactSelect from "react-select";
import countryList from "react-select-country-list";
import { createMarketplaceApi, marketplaceApi, uploadApi, walletsApi, confSupportSwapApi, getSupportCreditsApi, confCancelSupportApi } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from "../../contexts";
import { getProdFiles, getProdImages, getProdVideos, marketplace_path, toast_error, toast_success, upload_path } from "../../utils";

const MarketplaceEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { cryptos, settings, conf2ndPwd, setLoading, check2ndPassword, onDeposit, onWithdraw, user } = useGlobalContext();

    const countryOption = countryList().getData();
    const [shipCountryVisible, setShipCountryVisible] = useState(true);
    const [shipCountriesList, setShipCountriesList] = useState([]);
    const [country, setCountry] = useState("");
    const [region, setRegion] = useState("");
    const [selectedItem, setSelectedItem] = useState({
        Quantity: '',
        Price: '',
        Feature: 'Y',
        Category: 0,
        ProductName: '',
        TypeOfItem: "Physical",
        Status: "A",
        Ship_On: "Y",
        ShipCountries: [],
        Description: "",
    });
    const [categories, setCategories] = useState([])
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [images, setImages] = useState([])
    const [files, setFiles] = useState([])
    const [videos, setVideos] = useState([])
    const [questions, setQuestions] = useState([])
    const [buySupportItem, setBuySupportItem] = useState({
        visible: false,
    })
    const [wallets, setWallets] = useState([]);
    const [stakedWallets, setStakedWallets] = useState([])
    const [supportCredits, setSupportCredits] = useState(0)
    const _data = buySupportItem.data || {};

    const updateSelection = (item) => setBuySupportItem(bef => ({ ...bef, ...item }));
    const initSelection = (item = {}) => setBuySupportItem({ ...item });
    const handleClose = () => {
        initSelection();
    };
    const _label = 'Buy';
    const isSwap = "";
    const feeAmount = () => (parseFloat(buySupportItem?.amount) || 0) * _fee;
    const _price = (id) => cryptos.find(item => item.id == id)?.Price || 0;
    const _fee = (id) => cryptos.find(item => item.id == id)?.SwapFee || 0;
    const _cryptoName = (id) => cryptos.find(item => item.id == id)?.CryptoName || "";
    const crypto = stakedWallets?.find(item => item.id == buySupportItem?.crypto) || {};

    const getAmount = (isShow = false) => {
        const tmp_amount = parseFloat(buySupportItem?.amount) || 0;
        var res_amount = 0;

        var selectItemPrice = _price(buySupportItem?.crypto) || 0;
        if (selectItemPrice > 0) {
            res_amount = tmp_amount / selectItemPrice;
        }
        // var selectItemFee = _fee(buySupportItem?.crypto) || 0;

        // res_amount = (tmp_amount * _price(_data.id)) / _price(crypto.CryptoID);
        return parseFloat((res_amount || 0).toFixed(5))
    }
    useEffect(() => {
        getWallets();
        getSupportCredits();
    }, [getWallets])

    const getWallets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await walletsApi();
            setWallets(res.wallets);
            setStakedWallets(res.staked_wallet);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR)
        } finally {
            setLoading(false);
        }
    }, [wallets, stakedWallets])

    const getSupportCredits = useCallback(async () => {
        try {
            if (id) {
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

    const handleAction = async (e) => {
        try {
            e?.preventDefault?.();
            if (!conf2ndPwd) return check2ndPassword(buySupportItem.password);
            const amount = getAmount();
            const tmp_amount = parseFloat(buySupportItem?.amount) || 0;
            if (isSwap && amount <= 0 && tmp_amount > 0) return toast_error(`You are not available to swap crypto. Please contract support.`, _ERROR_CODES.NO_PRICE);
            if (!amount || amount <= 0) return toast_error("Put correct amount", _ERROR_CODES.NO_ENOUGH_BALANCE);
            var res = '';

            if (0 > parseFloat(buySupportItem?.amount) || crypto.swap_balance < amount * (1 + _fee(buySupportItem.crypto) / 100)) {
                return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
            }
            setLoading(true);
            const data = {
                BusdAmount: buySupportItem?.amount,
                HiddenFeesInCrypto: amount * (_fee(buySupportItem.crypto) / 100),
                CryptoID: crypto.CryptoID,
                HiddenSwapCoin: getAmount(),
                product_id: selectedItem.id,
            };
            res = await confSupportSwapApi(data)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));

            setLoading(false);
            if (res?.success) {
                toast_success(res?.message);
                getWallets();
                initSelection();
                getSupportCredits();
            }
        } catch (error) {
            setLoading(false);
            toast_error(error, _ERROR_CODES.UKNOWN_ERROR);
        }
    }
    const handleCancelAction = async (e) => {
        try {
            e?.preventDefault?.();
            if (!conf2ndPwd) return check2ndPassword(buySupportItem.password);

            setLoading(true);
            const data = {
                supportCredits: parseFloat(supportCredits).toFixed(4),
                product_id: selectedItem.id,
            };
            var res = '';
            res = await confCancelSupportApi(data)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));

            setLoading(false);
            if (res?.success) {
                toast_success(res?.message);
                getWallets();
                initSelection();
                getSupportCredits();
            }
        } catch (error) {
            setLoading(false);
            toast_error(error, _ERROR_CODES.UKNOWN_ERROR);
        }
    }
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await marketplaceApi(id).catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res) {
                if (res.message) toast_success(res.message);
                setCategories(res.CategoryList || []);
                if (!id) return

                var data = res.marketplace || {};
                const tmp_images = getProdImages(data);
                const tmp_files = getProdFiles(data);
                const tmp_videos = getProdVideos(data);
                setImages(tmp_images)
                setFiles(tmp_files)
                setVideos(tmp_videos)
                setSelectedItem({ ...selectedItem, ...data });

                if (data.Country) setCountry(data.Country);
                if (data.State) setRegion(data.State);
                if (data.faq) setQuestions(data.faq || []);
                if (data.Ship_On === "Y") {
                    setShipCountryVisible(true);
                    setShipCountriesList(data.ShipCountries);
                }
            }
        } catch (error) {
            toast_error(typeof error == 'string' ? error : error.message)
        } finally {
            setLoading(false);
        }
    }, [categories, selectedItem, images, videos, files])

    const updateSelectedItem = (item) => setSelectedItem(prv => ({ ...prv, ...item }))

    const typeOfItem = {
        'Physical': 'Physical', 'DigitalBuyNow': 'Digital Buy Now', '7Days': '7 Days Access', '30Days': '30 Days Access'
    }
    const handleClick = (isFile) => {
        if (isFile) return fileInputRef.current.click();
        imageInputRef.current.click();
    };
    const handleRemove = (index, isFile) => {
        var tmp_images = images;
        var tmp_files = files;
        if (isFile) {
            const sIdx = tmp_files.findIndex(item => item.index == index)
            tmp_files.splice(sIdx, 1)
            setFiles([...tmp_files])
        } else {
            const sIdx = tmp_images.findIndex(item => item.index == index)
            tmp_images.splice(sIdx, 1)
            setImages([...tmp_images]);
        }
    }
    const handleChange = (event, type) => {
        const fileUploaded = Array.from(event.target.files);
        var tmp_images = images;
        var tmp_files = files;
        if (type == 0) {
            const new_images = fileUploaded.map((item, index) => ({ index: tmp_images.length + index, file_data: item }))
            tmp_images = [...tmp_images, ...new_images].slice(0, 5);
            setImages([...tmp_images])
        } else {
            const new_files = fileUploaded.map((item, index) => ({ index: tmp_files.length + index, file_data: item }))
            tmp_files = [...tmp_files, ...new_files].slice(0, 10);
            setFiles([...tmp_files]);
        }
    };

    const GridForm = (props) => {
        return (
            <Grid xs={12} md={props.col || 6} className={'pt-20'}>
                <FormControl fullWidth>
                    {props.children}
                </FormControl>
            </Grid>
        )
    }
    const ImageItem = (itemProps) => {
        return (
            <GridForm col={itemProps.col || 6}>
                <div className='marketplace-image-item' onClick={() => itemProps.add ? handleClick(itemProps.file_selector) : {}}>
                    {itemProps.add ?
                        <div>
                            <i className="pi pi-plus" ></i>
                        </div>
                        :
                        <>
                            <div className='close' onClick={() => handleRemove(itemProps.index, itemProps.file_selector)}>
                                <i className="pi pi-times"></i>
                            </div>
                            {itemProps.file_selector ?
                                <div>
                                    <Image src={DEF_IMAGE.file} def={DEF_IMAGE.file} className="small-image" />
                                    <div className='file-name'>{itemProps.filename}</div>
                                </div>
                                :
                                <Image src={itemProps.src} def={DEF_IMAGE.marketplace} />
                            }
                        </>
                    }
                </div>
            </GridForm>
        )
    }
    const saveData = async () => {
        if (!selectedItem.Category) return toast_error("Please choose the Category", _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.Quantity >= 0)) return toast_error("Please enter the valid  quantity.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.ProductName) return toast_error("Please enter the product name.", _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.Price > 0)) return toast_error("Please enter the valid price.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Description) return toast_error("Please enter the description.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Video) return toast_error("Please enter the video.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Name) return toast_error("Please enter the name.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Address) return toast_error("Please enter the address.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.City) return toast_error("Please enter the city.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.State) return toast_error("Please select the state.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Country) return toast_error("Please select the country.", _ERROR_CODES.INVALID_INPUT);
        if (!selectedItem.Zip) return toast_error("Please enter the zip.", _ERROR_CODES.INVALID_INPUT);

        var data = { ...selectedItem, questions };
        setLoading(true);

        await Promise.all([
            ...(new Array(5).fill(1).map(async (_, index) => {
                var filename = '';
                if (images && images.length > index) {
                    if (images[index].file_data) {
                        filename = `${(new Date()).getTime()}_${index}_${images[index].file_data.name}`;
                        var formdata = new FormData();
                        formdata.append('path', 'uploads/marketplaces');
                        formdata.append('filename', filename);
                        formdata.append('file', images[index].file_data);
                        var res = await uploadApi(formdata).catch(console.error);
                        if (!res) filename = '';
                    } else {
                        filename = images[index].file || '';
                    }
                }
                data[`Image${(index + 1)}`] = filename || '';
            })),
            ...(new Array(10).fill(1).map(async (_, index) => {
                var filename = '';
                if (files && files.length > index) {
                    if (files[index].file_data) {
                        filename = `${(new Date()).getTime()}_${index}_${files[index].file_data.name}`;
                        var formdata = new FormData();
                        formdata.append('path', 'uploads/marketplaces/tempfile');
                        formdata.append('filename', filename);
                        formdata.append('file', files[index].file_data);
                        var res = await uploadApi(formdata).catch(console.error);
                        if (!res) filename = '';
                    } else {
                        filename = files[index].file || '';
                    }
                }
                data[`File${(index + 1)}`] = filename || '';
            }))
        ])
        new Array(10).fill(1).map(async (_, index) => {
            if (!videos || videos.length <= index) data[`Video${(index + 1)}`] = '';
            else data[`Video${(index + 1)}`] = trim(videos[index].file) || '';
        });
        const res = await createMarketplaceApi(data)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            setTimeout(() => {
                navigate("/user/marketplace/items-sale");
            }, 1500);
        }
        setLoading(false);
    }
    const _amount = getAmount();
    return (
        <div className="marketplace-container">
            <section className="latest-articles posts blog-4">
                <div className="overlay">
                    <input ref={imageInputRef} onChange={(e) => handleChange(e, 0)} name="" type="file" id="file-selector" hidden multiple accept='image/*' />
                    <input ref={fileInputRef} onChange={(e) => handleChange(e, 1)} name="" type="file" id="file-selector" hidden multiple />
                    <Grid container spacing={3} className={'p-20'}>
                        <GridForm>
                            <InputLabel id="category-label">Choose Category</InputLabel>
                            <Select
                                required
                                label={"Choose Category"}
                                defaultValue={selectedItem.Category}
                                onChange={e => updateSelectedItem({ Category: e.target.value })}
                            >
                                <MenuItem key={0} value={0} disabled>{"- Select Category -"}</MenuItem>
                                {categories?.map((cat, idx) => <MenuItem key={idx} value={cat.ID}>{cat.Child}</MenuItem>)}
                            </Select>
                        </GridForm>
                        <GridForm>
                            <TextField id="outlined-basic" type={'number'} required label="Quantity" variant="outlined"
                                defaultValue={`${selectedItem.Quantity}`}
                                onChange={e => selectedItem.Quantity = e.target.value} />
                        </GridForm>
                        <GridForm>
                            <TextField id="outlined-basic" label="Product Name" required variant="outlined"
                                defaultValue={selectedItem.ProductName}
                                onChange={e => selectedItem.ProductName = e.target.value} />
                        </GridForm>
                        <GridForm>
                            <TextField id="outlined-basic" label="Price" required type={'number'} variant="outlined"
                                defaultValue={`${selectedItem.Price}`}
                                onChange={e => selectedItem.Price = e.target.value} />
                        </GridForm>
                        <GridForm col={12}>
                            <TextField id="standard-multiline-flexible" label="Description" required maxRows={1} multiline variant="outlined"
                                defaultValue={selectedItem.Description}
                                onChange={e => selectedItem.Description = e.target.value} />
                        </GridForm>
                        <GridForm>
                            <FormLabel id="feature-item-label">Feature item</FormLabel>
                            <RadioGroup
                                required
                                aria-labelledby="feature-item-label"
                                defaultValue={selectedItem.Feature}
                                onChange={e => updateSelectedItem({ Feature: e.target.value })}
                                name="feature-item-group"
                            >
                                <FormControlLabel value="Y" control={<Radio />} label="Yes &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Feature Item fee $3.00" />
                                <FormControlLabel value="N" control={<Radio />} label="No" />
                            </RadioGroup>
                        </GridForm>
                        <GridForm>
                            <FormLabel id="item-type-label">Type Of Item</FormLabel>
                            <RadioGroup
                                required
                                aria-labelledby="item-type-label"
                                defaultValue={selectedItem.TypeOfItem}
                                onChange={e => updateSelectedItem({ TypeOfItem: e.target.value })}
                                name="feature-item-group"
                            >
                                {Object.keys(typeOfItem).map((item, index) => (
                                    <FormControlLabel value={item} key={index} control={<Radio />} label={typeOfItem[item]} />
                                ))}
                            </RadioGroup>
                        </GridForm>
                        {/* <hr className='col-md-12' /> */}
                        <GridForm col={3}>
                            <FormControlLabel control={<Switch defaultChecked={selectedItem.Status === 'A'} onChange={(e) => { e.target.checked ? selectedItem.Status = "A" : selectedItem.Status = "I" }} />} label="Active" />
                        </GridForm>
                        <GridForm col={3}>
                            <FormControlLabel control={<Switch defaultChecked={selectedItem.Ship_On === 'Y'} onChange={(e) => {
                                if (e.target.checked) {
                                    selectedItem.Ship_On = "Y";
                                    setShipCountryVisible(true);
                                } else {
                                    selectedItem.Ship_On = "N";
                                    setShipCountryVisible(false);
                                }
                            }} />}
                                label="Ship On" />
                        </GridForm>
                        {
                            shipCountryVisible && <GridForm col={6}>
                                <ReactSelect
                                    options={countryOption}
                                    value={shipCountriesList}
                                    defaultValue={shipCountriesList}
                                    onChange={(value) => { selectedItem.ShipCountries = value; setShipCountriesList(value); }}
                                    menuPlacement="top"
                                    isSearchable={true}
                                    isMulti
                                />
                            </GridForm>
                        }
                        <div className='col-md-12 hr-title'><div>Images</div></div>
                        {images?.map((item, index) => <ImageItem col={2} {...item} src={item.file_data ? URL.createObjectURL(item.file_data) : marketplace_path(item.file)} key={index} />)}
                        {images?.length <= 5 && <ImageItem add col={2} />}
                        <div className='col-md-12 hr-title mt-40'><div>Files</div></div>
                        {files?.map((item, index) => <ImageItem col={2}  {...item} file_selector filename={item.file_data ? item.file_data.name : item.file} key={index} />)}
                        {files?.length <= 10 && <ImageItem add file_selector col={2} />}

                        <div className='col-md-12 hr-title mt-40'><div>Videos
                            {videos?.length <= 10 && (
                                <span className='video-plus' onClick={() => {
                                    if (videos.length <= 10) {
                                        setVideos(prev => ([...prev, { index: videos.length + 1, file: '' }]))
                                    }
                                }}><i className="pi pi-plus" ></i></span>
                            )}
                        </div></div>
                        <GridForm col={6}>
                            <TextField id="outlined-basic" label="Video" defaultValue={selectedItem.Video} onChange={e => selectedItem.Video = e.target.value} required variant="outlined" />
                        </GridForm>
                        {videos?.map((item, index) => (
                            <GridForm col={6} key={index}>
                                <TextField id="outlined-basic" label={`Video ${(index + 1)}`} defaultValue={item.file}
                                    onChange={e => item.file = e.target.value}
                                    required variant="outlined" />
                            </GridForm>
                        ))}
                        <div className='col-md-12 hr-title mt-40'><div>Owner</div></div>
                        <GridForm col={6}>
                            <TextField id="outlined-basic" label="Name" required variant="outlined"
                                defaultValue={selectedItem.Name}
                                onChange={e => selectedItem.Name = e.target.value} />
                        </GridForm>
                        <GridForm col={6}>
                            <TextField id="outlined-basic" label="Address" required variant="outlined"
                                defaultValue={selectedItem.Address}
                                onChange={e => selectedItem.Address = e.target.value} />
                        </GridForm>
                        <GridForm col={6}>
                            <TextField id="outlined-basic" label="City" required variant="outlined"
                                defaultValue={selectedItem.City}
                                onChange={e => selectedItem.City = e.target.value} />
                        </GridForm>
                        <GridForm col={6}>
                            <TextField id="outlined-basic" label="Zip" required variant="outlined"
                                defaultValue={selectedItem.Zip}
                                onChange={e => selectedItem.Zip = e.target.value} />
                        </GridForm>
                        <GridForm col={6}>
                            <CountryDropdown
                                className="font-weight-bold w-100 m-auto form-select rounded h-50px text-gray" required
                                onChange={(val) => { setCountry(val); selectedItem.Country = val }}
                                value={country}
                            />
                        </GridForm>
                        <GridForm col={6}>
                            <RegionDropdown
                                className="font-weight-bold w-100 m-auto form-select rounded h-50px text-gray"
                                country={country}
                                value={region}
                                onChange={(val) => { setRegion(val); selectedItem.State = val }}
                            />
                        </GridForm>
                        <div className='col-md-12 hr-title mt-40'>
                            <div>FAQ
                                <span className='video-plus' onClick={() => {
                                    setQuestions(prev => [...prev, { id: 0, question: '', answer: '' }])
                                }}>
                                    <i className="pi pi-plus" ></i>
                                </span>
                            </div>
                        </div>
                        {questions.map((item, index) => (
                            <div key={`${index}`} className='col-md-12' style={{borderBottom: "dotted 2px darkgray", paddingBottom:"20px"}}>
                            <FormControl key={`quest_${index}`} fullWidth variant="outlined" className="mt-4">
                                <InputLabel htmlFor={`question_${index}`}>{`Question #${index + 1}`}</InputLabel>
                                <OutlinedInput
                                    id={`question_${index}`}
                                    label={`Question #${index + 1}`}
                                    value={item.question}
                                    onChange={e => setQuestions(prev => {
                                        prev[index] = { ...prev[index], question: e.target.value };
                                        return [...prev];
                                    })}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton edge="end" onClick={() =>
                                                setQuestions(prev => {
                                                    prev.splice(index, 1);
                                                    return [...prev];
                                                })}>
                                                <i className='pi pi-times' />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                            </FormControl>

                            <FormControl key={`answer_${index}`} fullWidth variant="outlined" className="mt-4">
                                <InputLabel htmlFor={`answer_${index}`}>{`Answer #${index + 1}`}</InputLabel>
                                <OutlinedInput
                                    id={`answer_${index}`}
                                    label={`Answer #${index + 1}`}
                                    value={item.answer}
                                    onChange={e => setQuestions(prev => {
                                        prev[index] = { ...prev[index], answer: e.target.value };
                                        return [...prev];
                                    })}
                                />
                            </FormControl>
                            </div>
                        ))}
                    </Grid>
                    <Stack direction="row" spacing={2} className="mt-20 p-4">
                        <Button variant="contained" color="success" onClick={saveData}>Save</Button>
                        <Button variant="contained" color="error">Cancel</Button>
                    </Stack>
                </div>
            </section>
            {id &&
                <section className="latest-articles posts blog-4">
                    <div className="overlay pb-120">
                        <Grid container spacing={3} className={'p-20'}>
                            <GridForm col={12}>
                                <InputLabel>{settings.amountPerAns} BUSD per support credits ({settings.amountToModer} + {settings.amountToNet})</InputLabel>
                            </GridForm>
                            <GridForm col={6}>
                                <TextField id="outlined-basic1" label="Buy support credits(BUSD)" variant="outlined"
                                    defaultValue={Math.abs(parseFloat(supportCredits).toFixed(4))}
                                    InputProps={{
                                        readOnly: true
                                    }} />
                            </GridForm>
                            <GridForm col={6}>
                                <Stack direction="row" spacing={2}>
                                    <Button variant="contained" color="success" onClick={() => initSelection({ visible: true })}>Buy</Button>
                                    <Button variant="contained" color="error" onClick={() => initSelection({ cancel_visible: true })}>Cancel</Button>
                                </Stack>
                            </GridForm>
                        </Grid>
                    </div>
                </section>
            }
            <Dialog
                open={buySupportItem.visible || false}
                onClose={handleClose}
                scroll={'paper'}
                maxWidth={'xs'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>
                    {conf2ndPwd ? _label : 'Confirm secondary password'}
                </DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    {buySupportItem.visible &&
                        <form onSubmit={handleAction}>
                            {!conf2ndPwd ?
                                <TextField className='no-border-input m-5' autofocusmargin="dense" name='password' label="Secondary Password" type="password"
                                    fullWidth variant="standard"
                                    value={buySupportItem.password || ''}
                                    onChange={e => updateSelection({ password: e.target.value })}
                                />
                                :
                                <>
                                    <TextField name='amount' className='no-border-input m-5' autofocusmargin="dense" label={`${_label} Amount($BUSD)`} type="number"
                                        fullWidth variant="standard"
                                        value={buySupportItem.amount || ''}
                                        onChange={e => updateSelection({ amount: e.target.value })}
                                    />
                                    <>
                                        <br />
                                        <br />
                                        <FormControl fullWidth>
                                            <Select
                                                className="crypto-selector-img"
                                                value={buySupportItem.crypto || 0}
                                                onChange={e => updateSelection({ crypto: e.target.value })}
                                                inputProps={{
                                                    className: "crypto-selector-img"
                                                }}>
                                                <MenuItem value={0} key={0} disabled>
                                                    <div style={{ padding: 12 }}>Select coin to buy</div>
                                                </MenuItem>
                                                {stakedWallets?.map((crypto, cIndex) => {
                                                    if (crypto.id == 1) {
                                                        return (
                                                            <MenuItem value={crypto.id} key={cIndex}>
                                                                <Image
                                                                    className={'selector-img'}
                                                                    src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                                                <span>{crypto.CryptoName} {crypto.swap_balance - supportCredits}</span>
                                                            </MenuItem>
                                                        )
                                                    }
                                                })}
                                            </Select>
                                        </FormControl>
                                        {_amount <= 0 ?
                                            (buySupportItem.crypto && _price(buySupportItem.crypto) <= 0 ?
                                                <div className='error-text'>You are not available to swap crypto. Please contract support with error code {_ERROR_CODES.NO_PRICE}</div>
                                                :
                                                <></>
                                            )
                                            :
                                            (buySupportItem?.amount) ?
                                                <div>{`you are swapping ${(parseFloat(_amount) || 0) * (1 + _fee(buySupportItem.crypto) / 100)} ${_cryptoName(buySupportItem.crypto)} for $${buySupportItem.amount} credits with a swap fee of ${(parseFloat(_amount) || 0) * (_fee(buySupportItem.crypto) / 100)} ${_cryptoName(buySupportItem.crypto)}`} with a swap fee of </div>
                                                :
                                                <></>
                                        }
                                    </>
                                </>
                            }
                        </form>
                    }
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' disabled={conf2ndPwd && _amount <= 0} onClick={handleAction}>{conf2ndPwd ? _label : 'Confirm'}</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={buySupportItem.cancel_visible || false}
                onClose={handleClose}
                scroll={'paper'}
                maxWidth={'xs'}
                fullWidth={true}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title1" className='pt-20'>
                    {conf2ndPwd ? 'Do you cancel support' : 'Confirm secondary password'}
                </DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    {buySupportItem.cancel_visible &&
                        <form onSubmit={handleCancelAction}>
                            {!conf2ndPwd ?
                                <TextField className='no-border-input m-5' autofocusmargin="dense" name='password' label="Secondary Password" type="password"
                                    fullWidth variant="standard"
                                    value={buySupportItem.password || ''}
                                    onChange={e => updateSelection({ password: e.target.value })}
                                />
                                :
                                <>
                                </>
                            }
                        </form>
                    }
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleCancelAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
export default MarketplaceEdit;