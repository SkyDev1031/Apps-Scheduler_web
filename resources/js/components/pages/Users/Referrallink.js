import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { useCallback, useEffect, useState } from 'react';
import { cancelRefLinksApi, refLinksApi } from '../../api/OriginAPI.js';
import { Image, NumberView } from "../../components";
import { _ERROR_CODES } from '../../config';
import { useGlobalContext } from '../../contexts';
import { crypto_path, refLink, toast_error, toast_success } from "../../utils";

const Referrallink = () => {
    const [query, setQuery] = useState();
    const [data, setData] = useState([])
    const { setLoading, confirmDialog } = useGlobalContext();
    useEffect(() => {
        getData();
    }, [getData])

    const getData = useCallback(async (showLoading = true) => {
        try {
            setLoading(showLoading);
            const res = await refLinksApi();
            setData(res.links)
        } catch (error) {
            toast_error(error, _ERROR_CODES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    }, [data])
    const copyClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast_success("copied referral link");
    }
    const cancelItem = async (item) => {
        const isDelete = await confirmDialog('Confirm', 'Are you sure to cancel referral link?');
        if (!isDelete) return;
        const res = await cancelRefLinksApi(item.id)
            .catch(error => toast_error(error, _ERROR_CODES.NETWORK_ERROR));
        if (res?.success) {
            toast_success(res?.message || "Your referral link has been cancelled")
            // getInitialData();
            getData(false);
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
            <Column key={'Note'} header={'Note'} field={'Note'} sortable />
            <Column key={'Coin'} header={'Coin'} field={'CryptoName'} sortable
                body={
                    (rowData => (
                        <div className='crypto-cell'>
                            <Image src={crypto_path(rowData.wallet?.Image)} />
                            <span>{rowData.wallet?.CryptoName}</span>
                        </div>
                    ))
                } />
            <Column key={'Amount'} header={'Amount'} field={'Amount'} sortable
                body={rowData => <NumberView value={rowData.Amount} />} />
            <Column key={'Quantity'} header={'Quantity'} field={'Quantity'} sortable />
            <Column key={'Fees'} header={'Fees'} field={'Fees'} sortable
                body={rowData => <NumberView value={rowData.Fees} decimal={2} />} />

            <Column key={'Leg'} header={'Leg'} field={'PlaceReferralOn'} sortable />
            <Column key={'Status'} header={'Status'} field={'Status'} sortable
                body={rowData => <span className={rowData.Status == 'Pending' ? 'warning-text'
                    : rowData.Status == 'Cancel' ? 'error-text'
                        : 'info-text'}>{rowData.Status == 'Cancel' ? 'Cancelled' : rowData.Status}</span>} />
            <Column key={'Link'} header={'Link'} field={'Note'} sortable className='width-100'
                body={rowData => (
                    rowData.Status == 'Pending' && (
                        <>
                            <div className="form-group d-flex align-items-center clip-input">
                                <input value={refLink(rowData.ReferralUrl)} />
                                <i className="pi pi-copy" onClick={() => copyClipboard(refLink(rowData.ReferralUrl))}></i>
                            </div>
                        </>
                    )
                )}
            />
            <Column key={'id'} field={'id'} header={'Actions'}
                body={(rowData) => (
                    rowData.Status == 'Pending' && (
                        <div className='table-action'>
                            <Button label="Cancel" className="p-button-rounded p-button-danger m-1" onClick={() => cancelItem(rowData)} />
                        </div>
                    )
                )} />
        </DataTable>
    )
};

export default Referrallink;