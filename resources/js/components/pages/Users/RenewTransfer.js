import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField } from '@mui/material';
import moment from "moment";
import { InputSwitch } from "primereact";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { packagesApi, purchasesApi, renewPackageApi, transferPackageApi, updatUserAutoPay } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success, upload_path } from "../../utils";

const _ACT_TYPE = {
    RENEW: 0,
    TRANFER: 1,
}


const RenewTransfer = () => {
    const [query, setQuery] = useState();
    const [purchases, setPurchases] = useState([])
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        data: {}
    })
    const _data = selectedItem.data || {};
    const [selectedPackage, setSelectedPackage] = useState(null)
    const { conf2ndPwd, cryptos, setLoading, check2ndPassword } = useGlobalContext();
    const isRenew = selectedItem.type == _ACT_TYPE.RENEW;

    const _label = isRenew ? "Renew" : "Transfer";

    const navigate = useNavigate();
    useEffect(() => {
        getPurchases();
    }, [getPurchases])

    const getPurchases = useCallback(async () => {
        try {
            setLoading(true);
            const res = await purchasesApi();
            setPurchases(res.purchases);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [purchases]);

    const getPackage = useCallback((id) => {
        setLoading(true);
        packagesApi(id)
            .then(res => setSelectedPackage(res.data))
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false))
    }, [selectedPackage])

    const handleClose = () => {
        initSelection();
    };
    const updateSelection = (item) => setSelectedItem(bef => ({ ...bef, ...item }));
    const updateSelectionData = (item) => updateSelection({ data: { ..._data, ...item } });
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleAutoPay = async (value, row) => {
        let res = await updatUserAutoPay({ id: row.id, autoPay: value ? "1" : "0" });
        if (res.success) {
            toast_success(res.message);
            let updatedList = purchases.map(purchase => {
                if (purchase.id === row.id) {
                    return { ...purchase, autoPay: purchase.autoPay === "1" ? "0" : "1" }; //gets everything that was already in item, and updates "done"
                }
                return purchase; // else return unmodified item 
            });
            setPurchases(updatedList);
        } else {
            toast_error("Invalid Server Connection!");
        }
    }
    const handleAction = async (e) => {
        e?.preventDefault?.();
        if (!conf2ndPwd) return check2ndPassword(selectedItem.password);

        setLoading(true);

        var data = {
            PackageID: _data.package_id,
            PurchaseID: _data.id,
        }
        if (isRenew) {
            data = {
                ...data,
                price: _data.price,
                CryptoID: _data.CryptoID
            }
            const res = await renewPackageApi(data)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res.message);
            }
        } else {
            if (!_data.to_client) {
                setLoading(false)
                return toast_error("Put to client info", _ERROR_CODES.INVALID_INPUT);
            }
            data = {
                ...data,
                to_client: _data.to_client,
            }
            const res = await transferPackageApi(data)
                .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            if (res?.success) {
                toast_success(res.message);
            }
        }
        setLoading(false)
        initSelection();
        getPurchases();
    };
    const _crypto = cryptos.find(item => item.id == _data.CryptoID) || {};

    return (
        <>
            <DataTable value={purchases} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-end d-flex">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'PackageName'} header={'Package'} field={'PackageName'} sortable />
                <Column key={'cost'} header={'Package Cost'} field={'cost'} sortable />
                <Column key={'spent'} field={'spent'} header={'Crypto Spent'} sortable />
                <Column key={'purchase_date'} field={'purchase_date'} header={'Purchase Date'} sortable
                    body={rowData => <span>{moment(rowData.purchase_date).format('ll')}</span>}
                />
                <Column key={'exp_days'} field={'exp_days'} header={'Expiry Days'} sortable
                    body={rowData => (
                        rowData.active == 1 ?
                            <span className='success-text'>Pending ({rowData.realDays} days)</span>
                            :
                            rowData.BillingIntervalDays != 0 ?
                                rowData.exp_days < 0 ?
                                    <span className='warning-text'>Expired!</span>
                                    :
                                    <span className='success-text'>{rowData.exp_days} remaining to expire!</span>
                                :
                                <span>Unlimited!</span>
                    )}
                />
                <Column key={'id'} field={'id'} header={'Action'}
                    body={(rowData) => {
                        return (
                            <div className='table-action'>
                                {rowData.is_renew &&
                                    <Button label="Renew" className="p-button-rounded m-1" onClick={() => initSelection({ visible: true, data: rowData, type: _ACT_TYPE.RENEW })} />
                                }
                                {rowData.is_transfer &&
                                    <>
                                        <Button label="Transfer" className="p-button-rounded p-button-success m-1" onClick={() => {
                                            initSelection({ visible: true, data: rowData, type: _ACT_TYPE.TRANFER })
                                            getPackage(rowData.package_id);
                                        }} />
                                        {rowData.FolderName && <Button className="p-button-rounded p-button-help m-1" label='View' onClick={() => navigate(`/user/packages/${rowData.FolderName}`)} />}
                                    </>
                                }
                                <div className="p-input-icon-left my-auto ml-10px">
                                    <h6>Auto Pay for this Package</h6>
                                    <InputSwitch
                                        id="autoPay"
                                        name="autoPay"
                                        checked={rowData.autoPay === "1" ? true : false}
                                        onChange={(e) => {
                                            handleAutoPay(e.target.value, rowData);
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    }} />
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
                                        <Image src={upload_path('packageimages', _data.Image)} />
                                        <span>{_data.PackageName}</span>
                                    </div>
                                    <hr />
                                    {isRenew ?
                                        <>
                                            <div className='renew-detail'>
                                                1 {_data.CryptoName} equals:
                                                <div className='renew-item'>
                                                    <div className='warning-text'>${_crypto.Price || 0}</div>
                                                    <div>Cost: ${_data.CryptoAmount}</div>
                                                </div>
                                            </div>
                                            <div className='renew-detail mb-4'>
                                                Your {_data.CryptoName} balance:
                                                <div className='renew-item'>
                                                    <div className='warning-text'>${_crypto.balance > 0 ? (_crypto.balance - _data.CryptoAmount / _crypto.Price).toFixed(4) : "None"}</div>
                                                    <div>Cost: ${_crypto.balance > 0 ? (_data.CryptoAmount / _crypto.Price).toFixed(4) : 'None'}</div>
                                                </div>
                                            </div>

                                            <FormControl fullWidth>
                                                <Select
                                                    className="crypto-selector-img"
                                                    value={_data.CryptoID || 0}
                                                    onChange={e => updateSelectionData({ CryptoID: e.target.value })}
                                                    inputProps={{
                                                        className: "crypto-selector-img"
                                                    }}>
                                                    <MenuItem value={0} key={0} disabled>
                                                        <div style={{ padding: 12 }}>Select coin</div>
                                                    </MenuItem>
                                                    {cryptos?.map((crypto, cIndex) => (
                                                        <MenuItem value={crypto.id} key={cIndex}>
                                                            <Image
                                                                className={'selector-img'}
                                                                src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                                            <span>{crypto.CryptoName} - {crypto.balance}</span>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {!(_crypto.Price > 0) &&
                                                <div className={`mt-4 error-text`}>
                                                    {`You are not available to use ${_crypto.CryptoName || 'Crypto'} for now. Please contract support with error code #${_ERROR_CODES.NO_PRICE}`}
                                                </div>
                                            }
                                        </>
                                        :
                                        <>
                                            <div className='renew-detail mb-4'>
                                                <div className='renew-item'>
                                                    <div className='warning-text'>{selectedPackage?.BillingIntervalDays} Days</div>
                                                    <div>Cost: ${(selectedPackage?.CryptoAmount || 0).toFixed(4)}</div>
                                                </div>
                                            </div>
                                            <div className='renew-detail mb-4'>
                                                <div className='renew-item'>
                                                    <div className='warning-text'>{selectedPackage?.BillingIntervalDays90} Days</div>
                                                    <div>Cost: ${(selectedPackage?.CryptoAmount90 || 0).toFixed(4)}</div>
                                                </div>
                                            </div>
                                            <div className='renew-detail mb-4'>
                                                <div className='renew-item'>
                                                    <div className='warning-text'>{selectedPackage?.BillingIntervalDays365} Days</div>
                                                    <div>Cost: ${(selectedPackage?.CryptoAmount365 || 0).toFixed(4)}</div>
                                                </div>
                                            </div>
                                            <FormControl fullWidth>
                                                <TextField
                                                    required
                                                    id="standard-basic"
                                                    label="To Client"
                                                    placeholder='Screen Name or email id'
                                                    value={_data.to_client || ''}
                                                    onChange={e => updateSelectionData({ to_client: e.target.value })}
                                                />
                                            </FormControl>
                                        </>
                                    }
                                </>
                            }
                        </form>
                    }
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    {(!conf2ndPwd || (conf2ndPwd && _crypto.Price > 0)) &&
                        <Button className='p-button-success' disabled={!isRenew && !selectedPackage} onClick={handleAction}>{conf2ndPwd ? _label : 'Confirm'}</Button>
                    }
                </DialogActions>
            </Dialog >
        </>
    )
};

export default RenewTransfer;