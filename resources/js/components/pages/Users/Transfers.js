import moment from "moment";
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { acceptPackageTransfer, cancelPackageTransfer, transfersApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const RenewTransfer = () => {
    const [query, setQuery] = useState();
    const [transfers, setTransfers] = useState([])
    const { setLoading } = useGlobalContext();

    useEffect(() => {
        getTransfers();
    }, [getTransfers])

    const getTransfers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await transfersApi();
            setTransfers(res.transfers);
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [transfers]);

    const acceptTransfer = (data) => {
        setLoading(true);
        acceptPackageTransfer(data.ID)
            .then(res => {
                toast_success(res?.message);
                getTransfers()
            })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const cancelTransfer = (data, type) => {
        setLoading(true);
        cancelPackageTransfer(data.ID)
            .then(res => {
                toast_success(res?.message);
                getTransfers()
            })
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }

    return (
        <DataTable value={transfers} responsiveLayout="scroll" stripedRows paginator
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
            <Column key={'TransDate'} header={'Date'} field={'TransDate'} sortable
                body={rowData => moment(rowData.TransDate).format('lll')} />
            <Column key={'PackageName'} header={'Package'} field={'PackageName'} sortable />
            <Column key={'sender'} header={'Sender Screen Name'} field={'sender'} sortable />
            <Column key={'status_text'} field={'status_text'} header={'Status'} sortable
                body={(rowData) => (
                    <div className={rowData.Status == 'T' ? 'warning-text'
                        : rowData.Status == 'A' ? 'info-text'
                            : rowData.Status == 'C' ? 'error-text'
                                : 'info-text'}>{rowData.status_text}</div>
                )
                } />
            < Column key={'id'} field={'id'} header={'Action'}
                body={(rowData) => {
                    return (
                        <div className='table-action'>
                            {rowData.is_accept && <Button label="Accept" className="p-button-rounded p-button-success m-1" onClick={() => acceptTransfer(rowData)} />}
                            {rowData.is_cancel_sender && <Button label="Cancel" onClick={() => cancelTransfer(rowData, 0)} className="p-button-rounded p-button-danger m-1" />}
                            {rowData.is_cancel_receiver && <Button label="Cancel" onClick={() => cancelTransfer(rowData, 1)} className="p-button-rounded p-button-danger m-1" />}
                        </div>
                    )
                }} />
        </DataTable >
    )
};

export default RenewTransfer;