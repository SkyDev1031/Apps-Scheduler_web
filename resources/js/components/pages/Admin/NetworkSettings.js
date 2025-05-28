import {
    Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, TextField
} from '@mui/material';
import { Button, Column, DataTable, InputText } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useCallback, useEffect, useState } from 'react';
import { networkLogApi, updateNetworkApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from "../../utils";

const NetworkSettings = () => {
    const [rankQuery, setRankQuery] = useState()
    const [data, setData] = useState({})
    const { isAdmin, setLoading } = useGlobalContext();
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await networkLogApi();
            setData(res)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])
    const updateSelectedItem = (item) => setSelectedItem(prev => ({ ...prev, ...item }))
    const handleClose = () => {
        setSelectedItem(null)
    };
    const handleAction = async () => {
        if (!selectedItem) return;
        if (!(selectedItem.Subscription > 0)) return toast_error('Please put the valid L/R Packages Active', _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.Level1 > 0)) return toast_error('Please put the valid percentage for Sponsor level 1', _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.Level2 > 0)) return toast_error('Please put the valid percentage for Sponsor level 2', _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.Level3 > 0)) return toast_error('Please put the valid percentage for Sponsor level 3', _ERROR_CODES.INVALID_INPUT);
        if (!(selectedItem.LevelBinary > 0)) return toast_error('Please put the valid percentage for Binary', _ERROR_CODES.INVALID_INPUT);
        setLoading(true);
        const res = await updateNetworkApi(selectedItem)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res.message);
            handleClose()
            getData();
        }
    }

    return (
        <>
            <DataTable value={data.network_settings} responsiveLayout="scroll" stripedRows paginator
                resizableColumns columnResizeMode="fit" showGridlines
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                filters={{ 'global': { value: rankQuery, matchMode: FilterMatchMode.CONTAINS } }}
                header={() => (
                    <div className="justify-content-between d-flex">
                        <h4 className='table-title'>{isAdmin ? 'Network Settings' : 'RANK CHART'}</h4>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={rankQuery} onChange={e => setRankQuery(e.target.value)} placeholder="Search by keyword" />
                        </span>
                    </div>
                )}
            >
                <Column key={'Rank'} header={'Rank'} field={'Rank'} sortable style={{ color: '#8ec545' }} />
                <Column key={'Subscription'} header={'L/R Packages Active'} field={'Subscription'} sortable />
                <Column key={'Level1'} header={'Sponsor Level 1 (%)'} field={'Level1'} style={{ color: '#016cb0' }} sortable
                    body={rowData => `${rowData.Level1}%`} />
                <Column key={'Level2'} header={'Sponsor Level 2 (%)'} field={'Level2'} style={{ color: '#016cb0' }} sortable
                    body={rowData => `${rowData.Level2}%`} />
                <Column key={'Level3'} header={'Sponsor Level 3 (%)'} field={'Level3'} style={{ color: '#016cb0' }} sortable
                    body={rowData => `${rowData.Level3}%`} />
                <Column key={'LevelBinary'} header={'Binary (%)'} field={'LevelBinary'} style={{ color: 'orange' }} sortable
                    body={rowData => `${rowData.LevelBinary}%`} />
                {isAdmin &&
                    <Column key={'id'} header={'Edit'} field={'id'} body={rowData => (
                        <div className='table-action'>
                            <Button label="Edit" className="p-button-rounded m-1" onClick={() => setSelectedItem(rowData)} />
                        </div>
                    )}
                    />
                }
            </DataTable>


            <Dialog
                open={selectedItem != null || false}
                scroll={'paper'} maxWidth={'md'} fullWidth
                aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description"
                onClose={handleClose}
            >
                <DialogTitle id="scroll-dialog-title" className='pt-20'>{'Edit rank'}</DialogTitle>
                {selectedItem &&
                    <DialogContent dividers={true} className="p-20">
                        <FormControl fullWidth className="mb-4">
                            <TextField id="rank" label="Rank" required variant="outlined" placeholder='Rank' type={'number'}
                                defaultValue={`${selectedItem.Rank}`} disabled />
                        </FormControl>
                        <FormControl fullWidth className="mb-4">
                            <TextField id="packages_active" label="L/R Packages Active" required variant="outlined" placeholder='L/R Packages Active'
                                type={'number'} value={`${selectedItem.Subscription}`}
                                onChange={e => updateSelectedItem({ Subscription: e.target.value })} />
                        </FormControl>
                        <FormControl fullWidth className="mb-4">
                            <TextField id="sposor_level_1" label="Sponsor Level 1 (%)" required variant="outlined" placeholder='Sponsor Level 1 (%)'
                                type={'number'} value={`${selectedItem.Level1}`}
                                onChange={e => updateSelectedItem({ Level1: e.target.value })} />
                        </FormControl>
                        <FormControl fullWidth className="mb-4">
                            <TextField id="sposor_level_2" label="Sponsor Level 2 (%)" required variant="outlined" placeholder='Sponsor Level 2 (%)'
                                type={'number'} value={`${selectedItem.Level2}`}
                                onChange={e => updateSelectedItem({ Level2: e.target.value })} />
                        </FormControl>
                        <FormControl fullWidth className="mb-4">
                            <TextField id="sposor_level_3" label="Sponsor Level 3 (%)" required variant="outlined" placeholder='Sponsor Level 3 (%)'
                                type={'number'} value={`${selectedItem.Level3}`}
                                onChange={e => updateSelectedItem({ Level3: e.target.value })} />
                        </FormControl>
                        <FormControl fullWidth className="mb-4">
                            <TextField id="binary" label="Binary (%)" required variant="outlined" placeholder='Binary (%)'
                                type={'number'} value={`${selectedItem.LevelBinary}`}
                                onChange={e => updateSelectedItem({ LevelBinary: e.target.value })} />
                        </FormControl>
                    </DialogContent>
                }
                <DialogActions className='table-action p-20'>
                    <Button className='p-button-danger' onClick={handleClose}>Cancel</Button>
                    <Button className='p-button-success' onClick={handleAction}>{'Confirm'}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
};

export default NetworkSettings;