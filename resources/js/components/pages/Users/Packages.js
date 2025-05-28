import { FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select } from '@mui/material';
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buyPackageApi, packagesApi } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from "../../contexts";
import { crypto_path, packages_path, toast_error, toast_success } from "../../utils";


const Packages = () => {
    const [data, setData] = useState([])
    const { setLoading, cryptos, confirmDialog } = useGlobalContext();
    const navigate = useNavigate();

    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        setLoading(true)
        packagesApi()
            .then(res => setData(res.packages))
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }, [data])
    const updateData = (index, item) => {
        setData(bef => {
            bef[index] = { ...bef[index], ...item };
            return [...bef];
        })
    }
    const getPlan = (item) => {
        var price = item.CryptoAmount;
        var interval = item.BillingIntervalDays;
        if (item.plan == 1) {
            price = item.CryptoAmount90;
            interval = item.BillingIntervalDays90
        } else if (item.plan == 2) {
            price = item.CryptoAmount365
            interval = item.BillingIntervalDays365
        }
        return { billing_price: price || 1, billing_interval: interval || 0 }
    }
    const getPrice = (item) => {
        const { billing_price } = getPlan(item);
        const crypto = cryptos.find(tmp => tmp.id == item.crypto);
        if (!crypto) return `-`;
        if (!(crypto.Price > 0)) return false;
        const price = (billing_price / crypto.Price * (1 - crypto.discount / 100)).toFixed(5);
        return `${price} ${crypto.CryptoName}`;
    }

    const setSelectedItem = async (item, isView = false) => {
        if (isView) {
            // if (item.id == 1) {
            //     navigate(`/user/packages/crypto-pulse/${item.id}`);
            // } else {
            //     navigate("/user/packages/renew-transfer");
            // }
        } else {
            if (!(item.crypto > 0)) return toast_error("Please select the crypto", _ERROR_CODES.INVALID_INPUT);
            const { billing_price, billing_interval } = getPlan(item);
            const crypto = cryptos.find(tmp => tmp.id == item.crypto);
            const price = (billing_price / crypto.Price * (1 - crypto.discount / 100)).toFixed(5);
            if (!crypto.balance || crypto.balance < price) {
                toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
                return;
            }
            const confirmed = await confirmDialog(item.PackageName || 'Confirm', 'Are you sure to buy this package ?');
            if (!confirmed) return;
            const data = {
                package_id: item.id,
                CryptoID: item.crypto,
                price: price,
                billing_interval,
                billing_price,
                exists: item.purchase?.length > 0
            };
            try {
                await buyPackageApi(data)
                toast_success('You subscribed this package.');
                getData()
            } catch (error) {
                toast_error(error, _ERROR_CODES.NETWORK_ERROR);
            }
        }
    }
    const getCrypto = (item) => {
        if (!cryptos) return [];
        if (item.id == 1) {
            return cryptos.filter(tmp => tmp.pulse == 1) || [];
        } else if (item.id == 2) {
            return cryptos.filter(tmp => tmp.explorer == 1) || [];
        }
        return cryptos;
    }
    return (
        <div className='packages-container'>
            <div className="container" style={{ position: "relative" }}>
                <div className="row">
                    <h4 className="title">Popular Posts</h4>
                    {data?.map((item, index) => {
                        const _price = getPrice(item);
                        const _crypto = cryptos.find(tmp => tmp.id == item.crypto) || {};
                        return (
                            <div key={index} className="col-lg-3 mb-30" disabled={item.userNum >= item.limit ? true : false}>
                                <div className="marketplace-item zoom" onClick={() => {
                                    setSelectedItem(item, true)
                                }}>
                                    {item.status == 'Inactive' ?
                                        <div className="badge comming-badge">Comming<br />Soon</div> :
                                        item.purchase?.length > 0 ?
                                            (item.userNum >= item.limit ? < div className="badge expired-badge">Sold Out</div>
                                                : < div className="badge active-badge">Active</div>
                                            )
                                            : <div className="badge expired-badge">Expired!</div>
                                    }
                                    <div className="text-center">
                                        <Image src={packages_path(item.Image)} def={DEF_IMAGE.marketplace} />
                                        <div className="gray-bold">Package Name: </div>
                                        <h6 className="success-text"><b>{item.PackageName}</b></h6>
                                        <hr />
                                        <div className="gray-bold">Description: </div>
                                        <div className="description" dangerouslySetInnerHTML={{ __html: item.Description }} />
                                        <hr />
                                        <h6><b>Billing Interval and Cost:</b></h6>
                                        <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-radio-buttons-group-label"
                                                defaultValue={item.plan || 0}
                                                onChange={e => updateData(index, { plan: e.target.value })}
                                                name="radio-buttons-group"
                                            >
                                                <FormControlLabel value="0" control={<Radio />} label={`${item.BillingIntervalDays} days for ${item.CryptoAmount}`} />
                                                {item.BillingIntervalDays90 > 0 &&
                                                    <FormControlLabel value="1" control={<Radio />} label={`${item.BillingIntervalDays90} days for ${item.CryptoAmount90}`} />
                                                }
                                                {item.BillingIntervalDays365 > 0 &&
                                                    <FormControlLabel value="2" control={<Radio />} label={`${item.BillingIntervalDays365} days for ${item.CryptoAmount365}`} />
                                                }
                                            </RadioGroup>
                                        </FormControl>

                                        <FormControl fullWidth>
                                            <Select
                                                className="crypto-selector-img"
                                                value={item.crypto || 0}
                                                onChange={(e) => updateData(index, { crypto: e.target.value })}
                                                inputProps={{
                                                    className: "crypto-selector-img"
                                                }}>
                                                <MenuItem value={0} key={0} disabled>
                                                    <div style={{ padding: 12 }}>Pay with</div>
                                                </MenuItem>
                                                {getCrypto(item).map((crypto, cIndex) => (
                                                    <MenuItem value={crypto.id} key={cIndex}>
                                                        <Image
                                                            className={'selector-img'}
                                                            src={crypto_path(crypto.Image)} def={DEF_IMAGE.coin} />
                                                        <span>{crypto.CryptoName} - {crypto.balance}</span>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {_price ?
                                            <>
                                                <div className={`crypt-price`}>
                                                    {_price}
                                                </div>
                                                {item.BinaryPayoutEligible == 'Y' ?
                                                    <>
                                                        <div className="success-text">Binary Payout Eligible!</div>
                                                    </>
                                                    :
                                                    <>
                                                        <div className="error-text">Binary Payout not Eligible!</div>
                                                    </>
                                                }
                                                {item.status == 'Active' ?
                                                    (item.userNum >= item.limit ? <button className="cmn-btn btn-sm mt-2 disabled">Buy Now</button>
                                                        : <button className="cmn-btn btn-sm mt-2" onClick={() => setSelectedItem(item)}>
                                                            {item.purchase?.length > 0 ? 'Buy More' : 'Buy Now'}
                                                        </button>
                                                    )
                                                    : <button className="cmn-btn btn-sm mt-2 disabled">Buy Now</button>
                                                }
                                            </>
                                            :
                                            <div className={`mt-4 error-text`}>
                                                {`You are not available to use ${_crypto.CryptoName || 'Crypto'} for now. Please contract support with error code #${_ERROR_CODES.NO_PRICE}`}
                                            </div>
                                        }

                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

export default Packages;