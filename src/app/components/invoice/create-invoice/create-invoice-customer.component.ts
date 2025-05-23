import { ColDef, GridApi, GridReadyEvent, ICellEditorParams, ICellRendererParams } from 'ag-grid-community';
import { map, Observable } from 'rxjs';
import { OPTIONS_COUNT } from '../../../../util/constants';
import { displayAutoCompleteWithName } from '../../../../util/daybook.util';
import { FormColumnDef } from '../../../../util/form-column-def.type';
import { AutoCompleteEditorComponent } from '../../common/ag-grid/editor/auto-complete-editor/auto-complete-editor.component';
import { LabelColumnRendererComponent } from '../../common/ag-grid/renderer/label-column-renderer/label-column-renderer.component';
import { Country } from '../store/model/country.model';
import { selectAllCountries, selectSelectedCountry } from '../store/selectors/country.selectors';
import { CreateInvoiceDetailsComponent } from './create-invoice-details.component';
import { selectSelectedCustomer } from '../store/selectors/customer.selectors';

export enum CustomerFormItem {
    NAME = 'Name',
    MOBILE = 'Mobile',
    EMAIL = 'Email',
    GSTIN = 'GSTIN',
    LINE1 = 'Line1',
    LINE2 = 'Line2',
    STREET = 'Street',
    CITY = 'City',
    STATE = 'State',
    ZIP = 'Zip',
    COUNTRY = 'Country',
}
export class CreateInvoiceCustomerComponent extends CreateInvoiceDetailsComponent {

  public customerGridApi!: GridApi<FormColumnDef>;

  private findCustomerEditorComponent = (params: ICellEditorParams<FormColumnDef>) => {
    
    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      return this.findCountryEditorComponent(params.data.value);

    }

    return {
      component: null
    };

  };

  customerColumnDefs: ColDef<FormColumnDef>[] = [
    { field: 'label', headerName: '', width: 150 },
    {
      field: 'value',
      headerName: '',
      width: 200,
      editable: true,
      cellEditorSelector: this.findCustomerEditorComponent,
      cellRendererSelector: CreateInvoiceCustomerComponent.findCustomerCellRenderer,
    }
  ];

  customerRowData: FormColumnDef[] = [];

  fetchCountries = (val?: string | Country): Observable<Country[]> => {
    return this.store.select(selectAllCountries).pipe(
      map((countries) => {

        // If val is of type Country, return empty array
        if (val && typeof val === 'object') {
          return [];
        }

        if (!val?.trim()) {
          return countries.slice(0, OPTIONS_COUNT);
        }
  
        const filterVal = val.toLowerCase();
        return countries
          .filter((country) => country.name.toLowerCase().startsWith(filterVal))
          .slice(0, OPTIONS_COUNT);
      })
    );
  };

  handleCountryOptionSelected = (val: Country): void => {
    const rowNode = this.customerGridApi.getRowNode(CustomerFormItem.COUNTRY);
    if (rowNode) {
      rowNode.data = { label: CustomerFormItem.COUNTRY, value: val };
    }
    this.changeCurrency(val.currency);
  };


  private findCountryEditorComponent = (_valueP: unknown) => ({
    component: AutoCompleteEditorComponent<Country>,
    params: {
      optionsFetcher: this.fetchCountries,
      displayWith: displayAutoCompleteWithName,
      onOptionSelected: this.handleCountryOptionSelected
    }
  });

  private static findCustomerCellRenderer = (params:ICellRendererParams<FormColumnDef>) => {

    if (!params.data?.value) {

      return '';

    }

    switch (params.data.label) {

    case CustomerFormItem.COUNTRY:
      const dtF = params.data.value as Country;
      return {component: LabelColumnRendererComponent,
        params: {labelValue: dtF.name}};

    }
    return params.data.value;
  
  };

  onCustomerGridReady(params: GridReadyEvent<FormColumnDef>): void {
    this.customerGridApi = params.api;
    this.store.select(selectSelectedCustomer).subscribe((customer) => {
      if (customer) {
        this.store.select(selectSelectedCountry).subscribe((country) => {
          this.customerRowData = [
            { label: CustomerFormItem.NAME, value: customer.name },
            { label: CustomerFormItem.LINE1, value: customer.line1 },
            { label: CustomerFormItem.LINE2, value: customer.line2 },
            { label: CustomerFormItem.STREET, value: customer.street },
            { label: CustomerFormItem.CITY, value: customer.city },
            { label: CustomerFormItem.ZIP, value: customer.zip },
            { label: CustomerFormItem.STATE, value: customer.state },
            { label: CustomerFormItem.COUNTRY, value: country },
            { label: CustomerFormItem.EMAIL, value: customer.email },
            { label: CustomerFormItem.MOBILE, value: customer.mobile },
            { label: CustomerFormItem.GSTIN, value: customer.gstin }
        ];
        });
      }
    });
  }
}