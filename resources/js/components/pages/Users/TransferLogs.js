import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { acceptTransaction, cancelTransaction, deleteTransferApi, transferLogApi } from '../../api/OriginAPI.js';
import { Image } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, toast_error, toast_success } from "../../utils";

const TransferLogs = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { isAdmin, setLoading, confirmDialog } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await transferLogApi();
            setData(res.logs)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR)
        } finally {
            setLoading(false);
        }
    }, [data])

    const acceptTransfer = (data) => {
        setLoading(true);
        acceptTransaction(data.id)
            .then(res => {
                toast_success(res?.message);
                getData()
            })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const cancelTransfer = (data, type) => {
        setLoading(true);
        cancelTransaction(data.id)
            .then(res => {
                toast_success(res?.message);
                getData()
            })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));

    }
    const deleteTransfer = async ({ id }) => {
        var res = await confirmDialog();
        if (!res) return;
        setLoading(true);
        res = await deleteTransferApi(id)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            getData();
            toast_success(res?.message);
        }
    }
    return (
        <DataTable value={data} responsiveLayout="scroll" stripedRows paginator
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
            <Column key={'Date'} header={'Date'} field={'TransDate'} sortable
                body={rowData => moment(rowData.TransDate).format('lll')}
            />
            <Column key={'Coin'} header={'Coin'} field={'wallet'} sortable
                body={
                    (rowData => (
                        rowData.wallet ?
                            <div className='crypto-cell'>
                                <Image src={crypto_path(rowData.wallet.Image)} />
                                <span className='warning-text'>{rowData.wallet.CryptoName}</span>
                            </div>
                            :
                            <span>Deleted!</span>
                    ))
                } />
            <Column key={'withdarw_amount'} header={'Withdrawal Amount'} field={'withdarw_amount'} sortable />
            <Column key={'receive_amount'} header={'Receive Amount'} field={'receive_amount'} sortable />
            <Column key={'Fees'} header={'Fees'} field={'Fees'} sortable />
            <Column key={'ScreenName'} header={'Sender Screen Name'} field={'ScreenName'} sortable />
            <Column key={'Status'} field={'Status'} header={'Status'}
                body={(rowData) => {
                    return (
                        rowData.Status == 'P' ?
                            <div className='warning-text'>Pending</div>
                            :
                            rowData.Status == 'A' ?
                                <div className='info-text'>Completed</div>
                                :
                                rowData.Status == 'C' ?
                                    <div className='error-text'>Cancelled</div>
                                    :
                                    <div className='info-text'>Confirmed</div>
                    )
                }} />
            <Column key={'id'} field={'id'} header={'Actions'}
                body={(rowData) => {
                    return (
                        <div className='table-action'>
                            {isAdmin ?
                                <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => deleteTransfer(rowData)} />
                                :
                                <>
                                    {rowData.isAccept && <Button label="Accept" className="p-button-rounded m-1" onClick={() => acceptTransfer(rowData)} />}
                                    {rowData.Status == 'P' &&
                                        <Button label="Cancel" onClick={() => cancelTransfer(rowData)} className="p-button-rounded p-button-danger m-1" />
                                    }
                                </>
                            }
                        </div>
                    )
                }} />
        </DataTable>
    )
};

export default TransferLogs;