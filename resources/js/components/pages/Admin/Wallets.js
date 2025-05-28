import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, Input, InputAdornment, InputLabel, TextField } from '@mui/material';
import { Button, Column, DataTable, InputText, MultiSelect } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { confPayoutApi, getAdminWalletsApi, transfer2AdminApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from '../../components';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    PAYOUT: 0,
    AMOUNT2ADMIN: 1,
    HOLD2ADMIN: 2
};

const Wallets = (props) => {
    const { id } = useParams()
    const _id = props.id || id;
    const isManager = _id == 1;

    const [data, setData] = useState([])
    const [query, setQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        data: {}
    })
    const _isPayout = selectedItem.type == _ACT_TYPE.PAYOUT;
    const _isAmount2Admin = selectedItem.type == _ACT_TYPE.AMOUNT2ADMIN;
    const _isHold2Admin = selectedItem.type == _ACT_TYPE.HOLD2ADMIN;

    const _data = selectedItem.data || {};
    const _amount = selectedItem.amount || 0;

    const { setLoading, contracts, conf2ndPwd, check2ndPassword, onWithdraw } = useGlobalContext();

    useEffect(() => {
        getData();
    }, [])
    const getData = () => {
        setLoading(true);
        getAdminWalletsApi(_id)
            .then(res => setData(res?.wallets || []))
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false))
    }
    const updateSelection = (item) => setSelectedItem(bef => ({ ...bef, ...item }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleClose = () => {
        initSelection();
    };
    const contractAddrFilterElement = (options) => {
        return (
            <MultiSelect
                value={options.value}
                options={contracts.map(item => item.address)}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Any" className="p-column-filter"
            />
        )
    }
    const handleAction = async (e) => {
        try {
            e?.preventDefault?.();
            if (!conf2ndPwd) return check2ndPassword(selectedItem.password);
            if (!_amount || _amount <= 0) return toast_error("Put correct amount", _ERROR_CODES.INVALID_INPUT);
            if (_amount > _data.balance) return toast_error(`Insufficient Balance!`, _ERROR_CODES.NO_ENOUGH_BALANCE)
            setLoading(true)
            var res;

            if (_isPayout) {
                res = await onWithdraw(_data, _amount)
                    .catch(err => toast_error(err, _ERROR_CODES.WITHDRAW_ERROR));
                if (res) {
                    res = await confPayoutApi({
                        crypto_id: _data.id,
                        amount: _amount,
                        transaction_id: res.transactionHash
                    }).catch(err => toast_error(err, _ERROR_CODES.PAYOUT_ERROR));
                }
            } else {
                res = await transfer2AdminApi({
                    crypto_id: _data.id,
                    amount: _amount,
                    balance: _data.balance,
                    isHold: _isHold2Admin,
                    user_id: _id,
                }).catch(err => toast_error(err, _ERROR_CODES.PAYOUT_ERROR));
            }

            if (res) {
                if (res.message) toast_success(res.message);
                initSelection();
                getData();
            }
        } catch (error) {
            toast_error(error, _ERROR_CODES.UKNOWN_ERROR);
        } finally {
            setLoading(false)
        }
    }
    const OnAction = (data, type) => {
        initSelection({ visible: true, data, type })
    }

    return (
        <>
            <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS }, 'address': { value: null, matchMode: FilterMatchMode.IN } }}
                filterDisplay="menu"
                globalFilterFields={["address"]}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <h4 className='table-title'>Wallets Balance</h4>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword"
                            />
                        </span>
                    </div>
                )}
            >
                <Column key={'crypto'} header={'Crypto'} field={'CryptoName'} sortable
                    style={{ width: '15%' }}
                    body={
                        (rowData => (
                            <div className='crypto-cell'>
                                <Image src={crypto_path(rowData.Image)} />
                                <span>{rowData.CryptoName}</span>
                            </div>
                        ))
                    } />
                <Column key={'balance'} field={'balance'} header={'balance'} sortable
                    style={{ width: '15%' }}
                    body={rowData => <NumberView value={rowData.balance} />}
                />
                {isManager ?
                    <Column key={'staked_amount'} field={'staked_amount'} header={'Staked Amount'} sortable
                        style={{ width: '15%' }}
                        body={rowData => <NumberView value={rowData.staked_amount} />}
                    />
                    :
                    <Column key={'hold_amount'} field={'hold_amount'} header={'Home Amount'} sortable
                        style={{ width: '15%' }}
                        body={rowData => <NumberView value={rowData.hold_amount} />}
                    />
                }
                <Column key={'address'} header={'Contract Address'} field={'address'} sortable filter
                    filterPlaceholder='Filter by contract address' filterElement={contractAddrFilterElement} filterField="address"
                    showFilterMatchModes={false} filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '14rem', width: '50%' }}
                />
                <Column key={'id'} field={'id'} header={''}
                    style={{ width: '20%' }}
                    body={(data) => (
                        <div className='table-action'>
                            {isManager ?
                                <Button label="Payout" className="p-button-rounded p-button-success m-1" onClick={() => OnAction(data, _ACT_TYPE.PAYOUT)} />
                                :
                                <>
                                    <Button label="Transfer to admin" className="p-button-rounded p-button-success m-1" onClick={() => OnAction(data, _ACT_TYPE.AMOUNT2ADMIN)} />
                                    <Button label="Hold amount to admin" className="p-button-rounded p-button-success m-1" onClick={() => OnAction(data, _ACT_TYPE.HOLD2ADMIN)} />
                                </>
                            }
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
                    {conf2ndPwd ? "Payout" : 'Confirm secondary password'}
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
                                    <FormControl fullWidth variant="standard">
                                        <InputLabel htmlFor="standard-adornment-password">{_isPayout ? 'Payout Amount' : 'Transfer Amount'}</InputLabel>
                                        <Input
                                            id="standard-adornment-password"
                                            value={selectedItem.amount || ''}
                                            onChange={e => updateSelection({ amount: e.target.value })}
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => updateSelection({ amount: _data.balance })}>MAX</IconButton>
                                                </InputAdornment>
                                            }
                                        />
                                    </FormControl>
                                    {_isPayout && _amount > 0 && <div className='wallet-desc'>You will receive {_amount} to Wallet</div>}
                                </>
                            }
                        </form>
                    }
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{conf2ndPwd ? (_isPayout ? 'Withdraw' : _isAmount2Admin ? 'Transfer amount to admin' : 'Transfer Hold amount to admin') : 'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Wallets;