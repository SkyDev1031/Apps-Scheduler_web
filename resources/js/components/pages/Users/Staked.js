import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select, TextField } from '@mui/material';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Row } from 'primereact/row';
import { useCallback, useEffect, useState } from 'react';
import { confStakeApi, confUnStakeApi, getBitqueryTemplateSettings, stakedApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { DEF_IMAGE, _ERROR_CODES } from "../../config";
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success, upload_path } from "../../utils";

const _ACT_TYPE = {
    STAKE: 0,
    UNSTAKE: 1,
}
const Staked = () => {
    const { setLoading, conf2ndPwd, check2ndPassword } = useGlobalContext();
    const [isStackingTab, setStackingTab] = useState(false);
    const [stakedQuery, setStakedQuery] = useState()
    const [mystakedQuery, setMystakedQuery] = useState();
    const [staked, setStaked] = useState([])
    const [wallets, setWallets] = useState([])
    const [selectedItem, setSelectedItem] = useState({
        visible: false,
        data: null
    })
    const isUnstake = selectedItem.type == _ACT_TYPE.UNSTAKE;
    const _label = isUnstake ? 'Unstake' : 'Stake';

    useEffect(() => {
        getStaked();
        getTemplateSettings();
    }, [getStaked])

    const getStaked = useCallback(async () => {
        try {
            setLoading(true);
            const res = await stakedApi();
            setWallets(res.wallets);
            setStaked(res.myStaked);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false)
        }
    }, [wallets, staked])
    const getTemplateSettings = useCallback(async () => {
        try {
            let res = await getBitqueryTemplateSettings();
            if (res.success) {
                setStackingTab(res.data.isStackingTab === 1 ? true : false);
            }
        } catch (error) {
            console.log("User Staked getTemplateSettings error === : ", error);
            toast_error("Invalid Server Connection!");
        }
    }, [])

    const updateSelection = (item) => setSelectedItem(bef => ({ ...bef, ...item }));
    const initSelection = (item = {}) => setSelectedItem({ ...item });

    const handleClose = () => {
        initSelection();
    };
    const handleAction = async (e) => {
        try {
            e?.preventDefault?.();
            if (!conf2ndPwd) return check2ndPassword(selectedItem.password)

            const amount = parseFloat(selectedItem.amount)
            const _data = selectedItem.data
            if (!_data || !_data.id || _data.id < 0) {
                return toast_error(`Select crypto to ${_label}`, _ERROR_CODES.INVALID_INPUT);
            }
            var res = {};
            if (isUnstake) {
                if (parseFloat(_data.NetworkBalance) < amount) {
                    return toast_error('Insufficient balance!', _ERROR_CODES.NO_ENOUGH_BALANCE);
                }
                const data = {
                    StakedID: _data.id,
                    CryptoID: _data.CryptoID,
                    UnstakeAmount: amount,
                };
                res = await confUnStakeApi(data)
                    .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));;
            } else {
                if (parseFloat(_data.final_wallet_balance) < amount) {
                    return toast_error('Insufficient balance!', _ERROR_CODES.NO_ENOUGH_BALANCE);
                }
                res = await confStakeApi({
                    cid: _data.id,
                    StakeAmount: amount,
                }).catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
            }
            if (res?.success) {
                toast_success(res?.message);
                getStaked();
                initSelection();
            }
        } catch (error) {
            toast_error(error, _ERROR_CODES.UKNOWN_ERROR);
        }
    };
    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="Crypto" rowSpan={2} />
                <Column header="Total Staked" rowSpan={2} sortable />
                <Column header="Swap amount" colSpan={2} />
                <Column header="Fees" colSpan={2} />
                <Column header="Balance" rowSpan={2} sortable />
            </Row>
            <Row>
                <Column header="+ Swap From" sortable />
                <Column header="- Swap To" sortable />
                <Column header="+ Fees" sortable />
                <Column header="+ Collected Fees" sortable />
            </Row>
        </ColumnGroup>
    );
    return (

        <>
            {
                isStackingTab ? <div className='staked-container'>
                    <DataTable value={wallets} responsiveLayout="scroll" stripedRows paginator
                        headerColumnGroup={headerGroup}
                        resizableColumns columnResizeMode="fit" showGridlines
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                        filters={{ 'global': { value: stakedQuery, matchMode: FilterMatchMode.CONTAINS } }}
                        header={() => (
                            <div className="d-flex justify-content-end">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={stakedQuery} onChange={e => setStakedQuery(e.target.value)} placeholder="Search by keyword" />
                                </span>
                            </div>
                        )}
                    >
                        <Column key={'crypto'} header={'Crypto'} field={'CryptoName'} sortable
                            body={(rowData => (
                                <div className='crypto-cell'>
                                    <Image src={crypto_path(rowData.Image)} />
                                    <span>{rowData.CryptoName}</span>
                                </div>)
                            )} />
                        <Column key={'StakeAmount'} field={'StakeAmount'} body={rowData => <NumberView value={rowData.StakeAmount} />} />
                        <Column key={'SwapAmount'} field={'SwapAmount'} body={rowData => <NumberView value={rowData.SwapAmount} />} />
                        <Column key={'SwapAmountInCrypto'} field={'SwapAmountInCrypto'} body={rowData => <NumberView value={rowData.SwapAmountInCrypto} />} />
                        <Column key={'FeesInCrypto'} field={'FeesInCrypto'} body={rowData => <NumberView value={rowData.FeesInCrypto} />} />
                        <Column key={'SwapFeesCollected'} field={'SwapFeesCollected'} body={rowData => <NumberView value={rowData.SwapFeesCollected} />} />
                        <Column key={'balance'} field={'balance'} body={rowData => <NumberView value={rowData.balance} />} />
                    </DataTable>
                    <br />
                    <br />
                    <h3>My stake</h3>
                    <br />
                    <DataTable value={staked} responsiveLayout="scroll" stripedRows paginator resizableColumns columnResizeMode="fit" showGridlines
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                        filters={{ 'global': { value: mystakedQuery, matchMode: FilterMatchMode.CONTAINS } }}
                        header={() => (
                            <div className="d-flex justify-content-end">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={mystakedQuery} onChange={e => setMystakedQuery(e.target.value)} placeholder="Search by keyword" />
                                </span>
                                <div className='table-action' style={{ position: "absolute", left: 10, top: 15 }}>
                                    <Button className="cmn-btn" onClick={() => initSelection({ visible: true, type: _ACT_TYPE.STAKE })}>Stake</Button>
                                </div>
                            </div>
                        )}
                    >
                        <Column key={'CryptoName'} header={'Crypto'} field={'CryptoName'} sortable
                            body={
                                (rowData => (<div className='crypto-cell'>
                                    <Image src={crypto_path(rowData.Image)} />
                                    <span>{rowData.CryptoName}</span>
                                </div>))
                            } />
                        <Column key={'StakeAmount'} field={'StakeAmount'} header={'Total Staked'} sortable
                            body={rowData => <NumberView value={rowData.StakeAmount} />}
                        />
                        <Column key={'UnstakeAmount'} field={'UnstakeAmount'} header={'Unstaked Amount'} sortable
                            body={rowData => <NumberView value={rowData.UnstakeAmount} />}
                        />
                        <Column key={'balance'} field={'balance'} header={'Balance'} sortable
                            body={rowData => <NumberView value={rowData.balance} />}
                        />
                        <Column key={'dollar'} field={'dollar'} header={'Current Price ($)'} sortable
                            body={rowData => <NumberView value={rowData.dollar} />}
                        />
                        <Column key={'percentage'} field={'percentage'} header={'Percentage'} sortable
                            body={rowData => <NumberView value={rowData.percentage} />}
                        />
                        <Column key={'action'} field={'id'} header={''} sortable
                            body={data => data.balance != 0 ? (
                                <div className='table-action'>
                                    <Button label="Unstake" className="p-button-rounded" onClick={() => initSelection({ visible: true, data, type: _ACT_TYPE.UNSTAKE })} />
                                </div>
                            ) : <></>}
                        />
                    </DataTable>

                    <Dialog
                        open={selectedItem.visible}
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
                                            <FormControl fullWidth>
                                                <Select
                                                    className="crypto-selector-img"
                                                    defaultValue={selectedItem.data || 0}
                                                    onChange={e => updateSelection({ data: e.target.value })}
                                                    inputProps={{ className: "crypto-selector-img" }}>
                                                    <MenuItem value={0} key={0} disabled>
                                                        <div style={{ padding: 12 }}>{`Select Coin to ${_label}`}</div>
                                                    </MenuItem>
                                                    {isUnstake ?
                                                        staked?.map((crypto, cIndex) => (
                                                            <MenuItem value={crypto} key={cIndex}>
                                                                <Image
                                                                    className={'selector-img'}
                                                                    src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                                                <span>{crypto.CryptoName} {crypto.balance}</span>
                                                            </MenuItem>
                                                        ))
                                                        :
                                                        wallets?.map((crypto, cIndex) => (
                                                            <MenuItem value={crypto} key={cIndex}>
                                                                <Image
                                                                    className={'selector-img'}
                                                                    src={upload_path('cryptoimages', crypto.Image)} def={DEF_IMAGE.coin} />
                                                                <span>{crypto.CryptoName} {crypto.final_wallet_balance}</span>
                                                            </MenuItem>
                                                        ))
                                                    }

                                                </Select>
                                                {isUnstake &&
                                                    <div className='wallet-desc'>Network Balance: {parseFloat(selectedItem.data.NetworkBalance).toFixed(4)}</div>
                                                }
                                                <TextField name='amount' className='no-border-input m-5' autofocusmargin="dense" label={`${_label} Amount`} type="number"
                                                    fullWidth variant="standard"
                                                    value={selectedItem.amount || ''}
                                                    onChange={e => updateSelection({ amount: e.target.value })}
                                                />
                                            </FormControl>
                                        </>
                                    }
                                </form>
                            }
                        </DialogContent>
                        <DialogActions className='table-action p-20'>
                            <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                            <Button className='p-button-success' onClick={handleAction}>{conf2ndPwd ? _label : 'Confirm'}</Button>
                        </DialogActions>
                    </Dialog >
                </div> : <div className='staked-container'>
                    <div className='row'>
                        <h4 className="title mt-5">Coming Soon!</h4>
                    </div>
                </div>
            }
        </>
    )
};

export default Staked;