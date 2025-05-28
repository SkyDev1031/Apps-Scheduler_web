import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField } from '@mui/material';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { confDepositApi, confSwapApi, confTransferApi, confWithdrawApi, walletsApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success, upload_path } from "../../utils";

const _ACT_TYPE = {
    DEPOSIT: 0,
    WITHDARW: 1,
    TRANSFER: 2,
    SWAP: 3
}

const Wallets = () => {
    const [query, setQuery] = useState();
    const [wallets, setWallets] = useState([]);
    const [stakedWallets, setStakedWallets] = useState([])
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        data: {}
    })
    const _data = selectedItem.data || {};

    const { cryptos, settings, conf2ndPwd, setLoading, check2ndPassword, onDeposit, onWithdraw } = useGlobalContext();

    const isDeposit = selectedItem.type == _ACT_TYPE.DEPOSIT;
    const isWithdrawal = selectedItem.type == _ACT_TYPE.WITHDARW;
    const isTransfer = selectedItem.type == _ACT_TYPE.TRANSFER;
    const isSwap = selectedItem.type == _ACT_TYPE.SWAP;

    const _fee_100 = (parseFloat(isDeposit ? _data.DepositFee : isWithdrawal ? _data.WithdrawalFee : isTransfer ? _data.TransferFee : isSwap ? _data.SwapFee : 0) || 0);
    const _fee = _fee_100 / 100;
    const _label = isDeposit ? "Deposit" : isWithdrawal ? "Withdrawal" : isTransfer ? "Transfer" : isSwap ? 'Swap' : "Dialog";

    const crypto = stakedWallets?.find(item => item.id == selectedItem?.crypto) || {};

    useEffect(() => {
        getWallets();
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

    const handleClose = () => {
        initSelection();
    };
    const handleAction = async (e) => {
        try {
            e?.preventDefault?.();
            if (!conf2ndPwd) return check2ndPassword(selectedItem.password);
            const amount = getAmount();
            const tmp_amount = parseFloat(selectedItem?.amount) || 0;
            if (isSwap && amount <= 0 && tmp_amount > 0) return toast_error(`You are not available to swap crypto. Please contract support.`, _ERROR_CODES.NO_PRICE);
            if (!amount || amount <= 0) return toast_error("Put correct amount", _ERROR_CODES.NO_ENOUGH_BALANCE);
            var res = '';
            if (selectedItem.type == _ACT_TYPE.DEPOSIT) {
                res = await onDeposit(_data, amount)
                    .catch(err => toast_error(err, _ERROR_CODES.DEPOSIT_ERROR));
                if (res) {
                    setLoading(true);
                    const data = {
                        cid: _data.id,
                        DepositAmount: getAmount(true),
                        ToReceiveWallet: _data.ReceiveWallet,
                        TransID: res.transactionHash,
                        hkey: _data.BlockchainName
                    };
                    res = await confDepositApi(data)
                        .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
                } else {
                    return;
                }
            } else if (selectedItem.type == _ACT_TYPE.WITHDARW) {
                if (amount > _data.balance) {
                    return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
                }
                res = await onWithdraw(_data, getAmount(true))
                    .catch(err => toast_error(err, _ERROR_CODES.WITHDRAW_ERROR));
                if (res) {
                    setLoading(true);
                    const data = {
                        cid: _data.id,
                        HiddenActualwithdrawalAmount: amount,
                        ToReceiveWallet: _data.ReceiveWallet,
                        TransID: res.transactionHash,
                        hkey: _data.BlockchainName,
                    };
                    res = await confWithdrawApi(data)
                        .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
                } else {
                    return;
                }
            } else if (selectedItem.type == _ACT_TYPE.TRANSFER) {
                if (amount > _data.balance) {
                    return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
                }
                setLoading(true);
                const data = {
                    ScreenNamePhoneEmail: selectedItem.receiver,
                    cid: _data.id,
                    TransferAmount: amount,
                    TransferFee: _data.TransferFee,
                    TransferFeeType: 'Expedited',
                };
                res = await confTransferApi(data)
                    .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            } else if (selectedItem.type == _ACT_TYPE.SWAP) {
                if (_data.balance < parseFloat(selectedItem?.amount) || crypto.swap_balance < amount) {
                    return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
                }
                setLoading(true);
                const data = {
                    cid: _data.id,
                    SwapAmount: selectedItem?.amount,
                    HiddenFeesInCrypto: feeAmount(),
                    CryptoID: crypto.CryptoID,
                    HiddenSwapCoin: getAmount(),
                };
                res = await confSwapApi(data)
                    .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            } else {
                throw 'Uknown action';
            }
            setLoading(false);
            if (res?.success) {
                toast_success(res?.message);
                getWallets();
                initSelection();
            }
        } catch (error) {
            setLoading(false);
            toast_error(error, _ERROR_CODES.UKNOWN_ERROR);
        }
    }

    const updateSelection = (item) => setSelectedItem(bef => ({ ...bef, ...item }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const feeAmount = () => (parseFloat(selectedItem?.amount) || 0) * _fee;

    const _price = (id) => cryptos.find(item => item.id == id)?.Price || 0;

    const getAmount = (isShow = false) => {
        const tmp_amount = parseFloat(selectedItem?.amount) || 0;
        var res_amount = 0;
        if (isTransfer) {
            if (isShow) res_amount = tmp_amount - tmp_amount * _fee
            else res_amount = tmp_amount;
        } else if (isDeposit || isWithdrawal) {
            if (isWithdrawal) {
                if (isShow) res_amount = tmp_amount - tmp_amount * _fee
                else res_amount = tmp_amount
            } else {
                if (isShow) res_amount = tmp_amount
                else res_amount = tmp_amount + tmp_amount * _fee
            }
        } else if (isSwap) {
            res_amount = (tmp_amount * _price(_data.id)) / _price(crypto.CryptoID);
        }
        return parseFloat((res_amount || 0).toFixed(5))
    }

    const _amount = getAmount();
    return (
        <>
            <DataTable value={wallets} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-end d-flex">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} name="query" placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'crypto'} header={'Crypto'} field={'CryptoName'} sortable
                    style={{ width: '25%' }}
                    body={
                        (rowData => (
                            <div className='crypto-cell'>
                                <Image src={crypto_path(rowData.Image)} />
                                <span>{rowData.CryptoName}</span>
                            </div>
                        ))
                    } />
                <Column key={'amount'} field={'balance'} header={'Balance'} sortable
                    style={{ width: '15%' }}
                    body={rowData => <NumberView value={rowData.balance} />}
                />
                <Column key={'hold_amount'} field={'hold_amount'} header={'Hold Amount'} sortable
                    style={{ width: '15%' }}
                    body={rowData => <NumberView value={rowData.hold_amount} />}
                />
                <Column key={'id'} field={'id'} header={''}
                    style={{ width: '45%' }}
                    body={(data) => (
                        <div className='table-action'>
                            <Button label="Deposit" className="p-button-rounded m-1" onClick={() => initSelection({ visible: true, data, type: _ACT_TYPE.DEPOSIT })} />
                            <Button label="Withdarwal" className="p-button-rounded p-button-warning m-1" onClick={() => initSelection({ visible: true, data, type: _ACT_TYPE.WITHDARW })} />
                            <Button label="Transfer" className="p-button-rounded p-button-success m-1" onClick={() => initSelection({ visible: true, data, type: _ACT_TYPE.TRANSFER })} />
                            <Button label="Swap" className="p-button-rounded p-button-help m-1" onClick={() => initSelection({ visible: true, data, type: _ACT_TYPE.SWAP })} />
                        </div>
                    )} />
            </DataTable>

            <Dialog
                open={selectedItem.visible || false}
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
                    {selectedItem.visible &&
                        <form onSubmit={handleAction}>
                            {!conf2ndPwd ?
                                <TextField className='no-border-input m-5' autofocusmargin="dense" name='password' label="Secondary Password" type="password"
                                    fullWidth variant="standard"
                                    value={selectedItem.password || ''}
                                    onChange={e => updateSelection({ password: e.target.value })}
                                />
                                :
                                <>
                                    <div className='crypto-cell crypto-lg'>
                                        <Image src={crypto_path(_data.Image)} />
                                        <span>{_data.CryptoName}</span>
                                    </div>
                                    <hr />
                                    {(isDeposit || isWithdrawal || isTransfer) && <div className='wallet-desc'>{_label} Fee %: {_fee_100}</div>}
                                    <TextField name='amount' className='no-border-input m-5' autofocusmargin="dense" label={`${_label} Amount`} type="number"
                                        fullWidth variant="standard"
                                        value={selectedItem.amount || ''}
                                        onChange={e => updateSelection({ amount: e.target.value })}
                                    />
                                    {isDeposit && <div className='wallet-desc'>Send {_amount} to Wallet</div>}
                                    {isWithdrawal && <div className='wallet-desc'>You will receive {getAmount(true)} to Wallet</div>}
                                    {isTransfer && (
                                        <>
                                            <div className='wallet-desc'>Client will receive {getAmount(true)}</div>
                                            <TextField name='Address' className='no-border-input m-5' autofocusmargin="dense" label="To Client" type="text"
                                                fullWidth variant="standard"
                                                value={selectedItem.receiver || ''}
                                                onChange={e => updateSelection({ receiver: e.target.value })}
                                            />
                                        </>
                                    )}
                                    {isSwap &&
                                        <>
                                            <br />
                                            <br />
                                            <FormControl fullWidth>
                                                <label>Select Coin to Swap:</label>
                                                <Select
                                                    className="crypto-selector-img"
                                                    value={selectedItem.crypto || 0}
                                                    onChange={e => updateSelection({ crypto: e.target.value })}
                                                    inputProps={{
                                                        className: "crypto-selector-img"
                                                    }}>
                                                    <MenuItem value={0} key={0} disabled>
                                                        <div style={{ padding: 12 }}>Select coin to swap</div>
                                                    </MenuItem>
                                                    {stakedWallets?.map((crypto, cIndex) => {
                                                        if (crypto.CryptoName !== _data.CryptoName) {
                                                            return (
                                                                <MenuItem value={crypto.id} key={cIndex}>
                                                                    <Image
                                                                        className={'selector-img'}
                                                                        src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                                                    <span>{crypto.CryptoName} {crypto.swap_balance}</span>
                                                                </MenuItem>
                                                            )
                                                        }
                                                    })}
                                                </Select>
                                            </FormControl>
                                            {_amount <= 0 ?
                                                (selectedItem.crypto && _price(selectedItem.crypto) <= 0 ?
                                                    <div className='error-text'>You are not available to swap crypto. Please contract support with error code {_ERROR_CODES.NO_PRICE}</div>
                                                    :
                                                    <></>
                                                )
                                                :
                                                (selectedItem?.amount && _fee && crypto.CryptoName) ?
                                                    <div>{`you are swapping ${(parseFloat(selectedItem?.amount) || 0) * (1 - _fee)} ${_data.CryptoName} for ${_amount} ${crypto.CryptoName} with a swap fee of ${feeAmount()} ${_data.CryptoName}`}</div>
                                                    :
                                                    <></>
                                            }
                                        </>
                                    }
                                </>
                            }
                        </form>
                    }
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' disabled={conf2ndPwd && isSwap && _amount <= 0} onClick={handleAction}>{conf2ndPwd ? _label : 'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default Wallets;