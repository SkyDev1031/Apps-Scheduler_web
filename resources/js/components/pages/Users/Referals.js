import { Box, Button, Card, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, OutlinedInput, Radio, RadioGroup, Select, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { addRefLinkApi, getRefLinkApi, updateRefLinkApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from '../../contexts';
import { refLink, toast_error, toast_success, upload_path } from '../../utils';

const INIT_REF_LINK = {
    cryptoId: 0,
    amount: '',
    quantity: '',
    note: '',
    placeRefOn: 'Least',
};
export default function Referals() {
    const { user, cryptos, settings, setLoading, getInitialData } = useGlobalContext()
    const [refLinks, setRefLinks] = useState({
        ReferralLink: (user.fullname || '').toLowerCase()
    })
    const [cryptoReflink, setCryptoReflink] = useState(INIT_REF_LINK);
    const updateCryptoRefLink = (item) => setCryptoReflink(bef => ({ ...bef, ...item }));

    useEffect(() => {
        getReflinks();
    }, [getReflinks])

    const getReflinks = useCallback(async () => {
        setLoading(true);
        const res = await getRefLinkApi().catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
        if (res?.success) {
            if (res.message) toast_success(res.message);
            setRefLinks(prev => ({ ...prev, ...res.data }));
        }
        setLoading(false);
    }, [refLinks]);

    const copyClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast_success("copied referral link");
    }
    const updateRefPlace = async () => {
        if (!refLinks.PlaceReferralOn) refLinks.PlaceReferralOn = 'Least';
        setLoading(true);
        const res = await updateRefLinkApi(refLinks).catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.message) toast_success(res.message);
        setLoading(false);
        getReflinks();
    }
    const _amount = cryptoReflink && settings && cryptoReflink.quantity && cryptoReflink.amount ? (cryptoReflink.quantity * cryptoReflink.amount + cryptoReflink.quantity * cryptoReflink.amount * settings.ReferralLinkGeneratorFee / 100) : 0;
    const _crypto = cryptos?.find(item => item.id == cryptoReflink.cryptoId) || {};

    const createRefLink = async () => {
        if (!cryptoReflink) return;
        if (!cryptoReflink.cryptoId) return toast_error('Please choose the crypto', _ERROR_CODES.INVALID_INPUT);
        if (!(_crypto.Price > 0)) return toast_error(`You are not available to use ${_crypto.CryptoName || 'Crypto'}. Please contract support.`, _ERROR_CODES.NO_PRICE);
        if (!(cryptoReflink.amount > 0)) return toast_error('Please put correct Amount', _ERROR_CODES.INVALID_INPUT);
        if (!(100 >= cryptoReflink.quantity > 0)) return toast_error('Please put correct Quantity, You can use number from 1 to 100.', _ERROR_CODES.INVALID_INPUT);
        if (!cryptoReflink.note) return toast_error('Please enter the Note', _ERROR_CODES.INVALID_INPUT);
        if (_amount > _crypto.balance) return toast_error('You have entered above balance!', _ERROR_CODES.NO_ENOUGH_BALANCE);
        if (!cryptoReflink.placeRefOn) cryptoReflink.placeRefOn = "Least"

        const _data = {
            'CID': cryptoReflink.cryptoId,
            'Amount': cryptoReflink.amount,
            'Quantity': cryptoReflink.quantity,
            'Fees': settings.ReferralLinkGeneratorFee,
            'Note': cryptoReflink.note,
            'PlaceReferralOn': cryptoReflink.placeRefOn,
        };
        setLoading(true);
        const res = await addRefLinkApi(_data).catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        // getInitialData()
        if (res?.success) {
            if (res.message) toast_success(res.message);
            setCryptoReflink(INIT_REF_LINK);
        }
        setLoading(false);
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid xs={5}>
                    <Card variant="outlined" className='p-4'>
                        <p className='mt-30'>Your Sponsor is: {user?.sponsor}</p>
                        <div className="form-group d-flex align-items-center clip-input mt-20">
                            <FormControl fullWidth variant="outlined">
                                <InputLabel htmlFor="ref_link">Referral link</InputLabel>
                                <OutlinedInput
                                    id="ref_link"
                                    label="Referral link"
                                    defaultValue={refLinks?.ReferralLink}
                                    startAdornment={
                                        <span className='success-text small-text'>{refLink()}</span>
                                    }
                                />
                            </FormControl>
                            <i className="pi pi-copy" onClick={() => copyClipboard(refLink((user.fullname || '').toLowerCase()))}></i>
                        </div>

                        <FormControl fullWidth className='mt-30'>
                            <FormLabel id="place-referral-on-label">Place Referrals On</FormLabel>
                            <RadioGroup
                                aria-required
                                aria-labelledby="place-referral-on-label"
                                value={refLinks?.PlaceReferralOn || 'Least'}
                                onChange={e => setRefLinks(bef => ({ ...bef, PlaceReferralOn: e.target.value }))}
                                name="place-referral-on"
                            >
                                <FormControlLabel value="Least" control={<Radio />} label="Leg With Least Amount Of Clients" />
                                <FormControlLabel value="Left" control={<Radio />} label="Left Leg" />
                                <FormControlLabel value="Right" control={<Radio />} label="Right Leg" />
                            </RadioGroup>
                        </FormControl>
                        <Button className='mt-20' variant="contained" color="success" onClick={updateRefPlace}>Update</Button>
                    </Card>
                </Grid>
                <Grid xs={7}>
                    <Card variant="outlined" className='p-4'>
                        <h5 className='title'>CRYPTO Referral Link</h5>
                        <FormControl fullWidth>
                            <Select
                                className="crypto-selector-img"
                                value={cryptoReflink.cryptoId}
                                onChange={e => updateCryptoRefLink({ cryptoId: e.target.value })}
                                inputProps={{
                                    className: "crypto-selector-img"
                                }}>
                                <MenuItem value={0} key={0} disabled>
                                    <div style={{ padding: 12 }}>Choose coin</div>
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
                        {cryptoReflink.cryptoId > 0 && !(_crypto?.Price > 0)
                            ?
                            <div className={`mt-4 error-text`}>
                                {`You are not available to use ${_crypto.CryptoName || 'Crypto'} for now. Please contract support with error code #${_ERROR_CODES.NO_PRICE}`}
                            </div>
                            :
                            <></>
                        }
                        <FormControl fullWidth className={'pt-20'}>
                            <div className='d-flex'>
                                <span>Referral Link Generator Fee: </span>
                                <NumberView value={settings.ReferralLinkGeneratorFee} left={5} decimal={4} suffix={'%'} color={"#00a654"} bold />
                            </div>
                        </FormControl>
                        <FormControl fullWidth className={'pt-20'}>
                            <TextField id="outlined-basic" label="Amount Of Tokens" required variant="outlined" type={'number'}
                                value={`${cryptoReflink.amount}`}
                                onChange={e => updateCryptoRefLink({
                                    amount: e.target.value ? Math.abs(e.target.value) : ''
                                })} />
                        </FormControl>
                        <FormControl fullWidth className={'pt-20'}>
                            <TextField id="outlined-basic" label="Quantity Of Signups (1~100)" required variant="outlined" type={'number'}
                                value={`${cryptoReflink.quantity}`}
                                onChange={e => updateCryptoRefLink({
                                    quantity: e.target.value ? Math.max(1, Math.min(Math.floor(e.target.value), 100)) : ''
                                })} />
                        </FormControl>
                        {_amount ?
                            <FormControl fullWidth className={'pt-20'}>
                                <div className='d-flex'>
                                    <span>Total Amount: </span>
                                    <NumberView value={_amount} decimal={2} color={"#00a654"} bold />
                                </div>
                            </FormControl>
                            :
                            <></>
                        }
                        <FormControl fullWidth className={'pt-20'}>
                            <TextField id="outlined-basic" label="Note" required variant="outlined" multiline
                                value={cryptoReflink.note}
                                onChange={e => updateCryptoRefLink({ note: e.target.value })} />
                        </FormControl>
                        <FormControl fullWidth className='mt-30'>
                            <FormLabel id="crypto-place-ref-on-label">Place Referrals On</FormLabel>
                            <RadioGroup
                                aria-required
                                name="crypto-place-ref-on"
                                aria-labelledby="crypto-place-ref-on-label"
                                value={cryptoReflink.placeRefOn || 'Least'}
                                onChange={e => updateCryptoRefLink({ placeRefOn: e.target.value })}
                            >
                                <FormControlLabel value="Least" control={<Radio />} label="Leg With Least Amount Of Clients" />
                                <FormControlLabel value="Left" control={<Radio />} label="Left Leg" />
                                <FormControlLabel value="Right" control={<Radio />} label="Right Leg" />
                            </RadioGroup>
                        </FormControl>
                        <Button className='mt-20' variant="contained" color="success" disabled={!(_crypto?.Price > 0)} onClick={createRefLink}>Create</Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}