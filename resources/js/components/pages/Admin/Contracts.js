import {
    Dialog, DialogActions, DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField
} from '@mui/material';
import { Button, Column, DataTable, InputText, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useState } from 'react';
import { contractApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    DEFAULT: -1,
    DEPLOY: 0,
    VERIFY: 1,
    ACTIVE: 2,
    DEACTIVE: 3,
    DELETE: 4,
}
const Contracts = () => {
    const [query, setQuery] = useState('')
    const { setLoading, contracts, getInitialData, confirmDialog } = useGlobalContext();
    const [deployModal, setDeployModal] = useState({
        visible: false,
        private_key: '',
        network: "BSC"
    })

    const onAction = async (data, type) => {
        var label = '';
        var req_data = { id: data.id, type };

        if (type == _ACT_TYPE.DEPLOY) {
            req_data = {
                ...req_data,
                address: deployModal.private_key,
                network: deployModal.network,
            }
        } else {
            if (type == _ACT_TYPE.VERIFY) label = 'verify';
            else if (type == _ACT_TYPE.ACTIVE) label = 'active';
            else if (type == _ACT_TYPE.DEACTIVE) label = 'deactive';
            else if (type == _ACT_TYPE.DELETE) label = 'delete';
            const title = 'Confirm';
            const body = `Are you sure to ${label} contract?`;
            var res = await confirmDialog(title, body);
            if (!res) return;
        }
        setLoading(true);
        res = await contractApi(req_data)
            .catch(err => toast_error(err, _ERROR_CODES.CONTRACT_ERROR));
        if (res?.success) {
            toast_success(res?.message);
            handleClose();
        }
        // await getInitialData();
        setLoading(false)
    }
    const updateDeployModal = (item) => setDeployModal(bef => ({ ...bef, ...item }));

    const handleClose = () => {
        updateDeployModal({ visible: false, private_key: '' })
    }
    const handleAction = async () => {
        if (!deployModal.private_key) return toast_error('Please put the private key', _ERROR_CODES.INVALID_INPUT);
        if (deployModal.private_key.length != 64) return toast_error('Invalid private key', _ERROR_CODES.INVALID_INPUT);
        onAction({ id: 0 }, _ACT_TYPE.DEPLOY);
    }
    return (
        <>
            <DataTable value={contracts} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: query, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <Button label='Deploy New Contract' onClick={() => updateDeployModal({ visible: true })} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'address'} header={'Contract Address'} field={'address'} sortable style={{ width: "10%" }} />
                <Column key={'balance'} header={'Balance'} field={'balance'} sortable style={{ width: "10%" }} />
                <Column key={'deployer'} header={'Creator'} field={'deployer'} sortable style={{ width: "10%" }} />
                <Column key={'owner'} header={'Owner'} field={'owner'} sortable style={{ width: "10%" }} />
                <Column key={'hash'} header={'TNX Hash'} field={'hash'} sortable style={{ width: "10%" }} />
                <Column key={'desc'} header={'Description'} field={'desc'} sortable style={{ width: "10%" }} />
                <Column key={'network'} header={'Network'} field={'network'} sortable style={{ width: "10%" }} />
                <Column key={'verified'} header={'Verified'} field={'verified'} sortable style={{ width: "10%" }}
                    body={rowData =>
                        <div className='table-action'>
                            {rowData.verified ?
                                <Tag value={'Verified'} severity={'success'} />
                                :
                                <Button label="Verify" className="p-button-rounded m-1" onClick={() => onAction(rowData, _ACT_TYPE.VERIFY)} />
                            }
                        </div>
                    } />
                <Column key={'actived'} header={'Actived'} field={'actived'} sortable style={{ width: "10%" }}
                    body={rowData => (
                        <div className='table-action'>
                            {rowData.actived ?
                                <Button label="Deactive" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(rowData, _ACT_TYPE.DEACTIVE)} />
                                :
                                <Button label="Active" className="p-button-rounded m-1" onClick={() => onAction(rowData, _ACT_TYPE.ACTIVE)} />
                            }
                        </div>
                    )
                    } />
                <Column key={'created_at'} header={'Created At'} field={'created_at'} sortable style={{ width: "10%" }} />
                <Column key={'id'} header={'Action'} field={'id'} sortable style={{ width: "10%" }}
                    body={rowData => (
                        <div className='table-action'>
                            < Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(rowData, _ACT_TYPE.DELETE)} />
                        </div>
                    )} />
            </DataTable>

            <Dialog
                open={deployModal.visible || false}
                scroll={'paper'} maxWidth={'md'} fullWidth
                aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description"
                onClose={handleClose}
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>{'Deploy new contract'}</DialogTitle>
                <DialogContent dividers={true} className="p-20">
                    <FormControl fullWidth className="mb-4">
                        {/* b9d2213f812a80ee34384b664760ec3787e3092899862b1339c18e5299b3368c */}
                        <TextField id="outlined-basic" label="Private key" required variant="outlined" placeholder='Private key'
                            type={'text'}
                            value={deployModal.private_key || ''}
                            onChange={e => updateDeployModal({ private_key: e.target.value })} />
                    </FormControl>
                    <FormControl fullWidth className='mt-30'>
                        <FormLabel id="place-referral-on-label">Network</FormLabel>
                        <RadioGroup
                            aria-required
                            aria-labelledby="place-referral-on-label"
                            value={deployModal.network || 'BSC'}
                            onChange={e => updateDeployModal({ network: e.target.value })}
                            name="place-referral-on"
                        >
                            <FormControlLabel value="ERC" control={<Radio />} label="Etherium Network" />
                            <FormControlLabel value="BSC" control={<Radio />} label="Binance Smart Chain" />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Contracts;