import moment from 'moment';
import { Button, Column, DataTable, InputText, Splitter, SplitterPanel, Tag } from 'primereact';
import { FilterMatchMode } from 'primereact/api';
import { useEffect, useState } from 'react';
import { deleteTwilioLogsApi, getTwilioLogsApi } from '../../api/OriginAPI.js';
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { toast_error, toast_success } from '../../utils';

const _ACT_TYPE = {
    SEND_REPLY: 0,
    SEND_DELETE: 1,
    INCOME_REPLY: 2,
    INCOME_DELETE: 3,
}
const TwilioLogs = () => {
    const [sendLogs, setSendLogs] = useState([])
    const [receiveLogs, setReceiveLogs] = useState([])
    const [sendLogsQuery, setSendLogsQuery] = useState('')
    const [receiveLogsQuery, setReceiveLogsQuery] = useState('')
    const { setLoading, confirmDialog } = useGlobalContext();

    useEffect(() => {
        getLogs();
    }, [])
    const getLogs = () => {
        setLoading(true)
        getTwilioLogsApi()
            .then(res => {
                setSendLogs(res.sendLogs);
                setReceiveLogs(res.receiveLogs);
            })
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR))
            .finally(() => setLoading(false));
    }
    const onAction = async (type, data) => {
        const isDelete = await confirmDialog();
        if (!isDelete) return;
        const res = await deleteTwilioLogsApi(data.id)
            .catch(err => toast_error(err, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message)
            getLogs();
        }
    }

    return (
        <Splitter container={"true"} spacing={2} layout="vertical">
            <SplitterPanel size={40} className="p-20" >
                <DataTable value={sendLogs} responsiveLayout="scroll" stripedRows paginator
                    resizableColumns columnResizeMode="fit" showGridlines
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                    filters={{ 'global': { value: sendLogsQuery, matchMode: FilterMatchMode.CONTAINS } }}
                    header={() => (
                        <div className="justify-content-between d-flex">
                            <h4 className='table-title'>Twilio Send Log</h4>
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={sendLogsQuery} onChange={e => setSendLogsQuery(e.target.value)} placeholder="Search by keyword" />
                            </span>
                        </div>
                    )}
                >
                    <Column key={'datetime'} header={'Date'} field={'datetime'} sortable
                        body={rowData => moment(rowData.datetime).format('lll')} />
                    <Column key={'fromnumber'} header={'From'} field={'fromnumber'} sortable />
                    <Column key={'sendto'} header={'Phone'} field={'sendto'} sortable />
                    <Column key={'message'} header={'Message'} field={'message'} sortable />
                    <Column key={'status'} header={'Status'} field={'status'} sortable
                        body={rowData => <Tag value={rowData.status == 'Y' ? 'Yes' : rowData.status == 'N' ? 'No' : 'Invalid'} severity={rowData.status == 'Y' ? 'success' : 'danger'} />} />
                    <Column key={'id'} header={'Action'} field={'id'} sortable
                        body={(rowData) => (
                            <div className='table-action'>
                                {/* <Button label="Reply" className="p-button-rounded m-1" onClick={() => onAction(_ACT_TYPE.SEND_REPLY, rowData)} /> */}
                                <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(_ACT_TYPE.SEND_DELETE, rowData)} />
                            </div>
                        )} />
                </DataTable>
            </SplitterPanel>
            <SplitterPanel size={60} className="p-20">
                <DataTable value={receiveLogs} responsiveLayout="scroll" stripedRows paginator
                    resizableColumns columnResizeMode="fit" showGridlines
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}
                    filters={{ 'global': { value: receiveLogsQuery, matchMode: FilterMatchMode.CONTAINS } }}
                    header={() => (
                        <div className="justify-content-between d-flex">
                            <h4 className='table-title'>Twilio Incoming Log</h4>
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={receiveLogsQuery} onChange={e => setReceiveLogsQuery(e.target.value)} placeholder="Search by keyword" />
                            </span>
                        </div>
                    )}
                >
                    <Column key={'datetime'} header={'Date'} field={'datetime'} sortable
                        body={rowData => moment(rowData.datetime).format('lll')} />
                    <Column key={'fromnumber'} header={'From'} field={'fromnumber'} sortable />
                    <Column key={'sendto'} header={'Phone'} field={'sendto'} sortable />
                    <Column key={'message'} header={'Message'} field={'message'} sortable />
                    <Column key={'status'} header={'Status'} field={'status'} sortable
                        body={rowData => <Tag value={rowData.status == 'Y' ? 'Yes' : 'No'} severity={rowData.status == 'Y' ? 'success' : 'danger'} />} />
                    <Column key={'id'} header={'Action'} field={'id'} sortable
                        body={(rowData) => (
                            <div className='table-action'>
                                {/* <Button label="Reply" className="p-button-rounded m-1" onClick={() => onAction(_ACT_TYPE.INCOME_REPLY, rowData)} /> */}
                                <Button label="Delete" className="p-button-rounded p-button-danger m-1" onClick={() => onAction(_ACT_TYPE.INCOME_DELETE, rowData)} />
                            </div>
                        )} />
                </DataTable>
            </SplitterPanel>
        </Splitter>
    )
}
export default TwilioLogs;