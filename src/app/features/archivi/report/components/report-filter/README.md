# Report Filter Component

A reusable filter component for report pages in the archivi module.

## Location
`src/app/features/archivi/report/components/report-filter/`

## Features
- Configurable fields (show/hide Cassa, Branch, Status)
- Read-only Status field option
- Required field validation for dates
- Automatic date normalization:
  - `trxDataDal` set to 00:00:00 (start of day)
  - `trxDataAl` set to 23:59:59 (end of day)
- Loading state integration

## Usage Example

### In your component TypeScript:
```typescript
import { ReportFilterComponent } from '../../components/report-filter/report-filter.component';

@Component({
  selector: 'app-your-report',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    ReportFilterComponent  // Import the filter component
  ],
  templateUrl: './your-report.component.html',
  styleUrls: ['./your-report.component.css'],
})
export class YourReportComponent {
  isLoading = signal(false);
  statusDefaultValue = TransactionStatus.YourStatus; // Optional
  
  onSearch(filterData: any): void {
    const { trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId } = filterData;
    // Your search logic here
  }
}
```

### In your component HTML:
```html
<app-report-filter
  [isLoading]="isLoading"
  [showCassa]="true"           <!-- Optional, default: true -->
  [showBranch]="true"          <!-- Optional, default: true -->
  [showStatus]="true"          <!-- Optional, default: true -->
  [statusReadOnly]="false"     <!-- Optional, default: false -->
  [statusDefaultValue]="60"    <!-- Optional, default: null -->
  [dataDalRequired]="false"    <!-- Optional, default: false -->
  [dataAlRequired]="false"     <!-- Optional, default: false -->
  (searchClick)="onSearch($event)"
></app-report-filter>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isLoading` | `signal<boolean>` | `signal(false)` | Disables search button when loading |
| `showCassa` | `boolean` | `true` | Show/hide Cassa field |
| `showBranch` | `boolean` | `true` | Show/hide Branch field |
| `showStatus` | `boolean` | `true` | Show/hide Status field |
| `statusReadOnly` | `boolean` | `false` | Make Status field read-only |
| `statusDefaultValue` | `number \| null` | `null` | Default value for Status field |
| `dataDalRequired` | `boolean` | `false` | Make Data Dal required |
| `dataAlRequired` | `boolean` | `false` | Make Data Al required |

## Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `searchClick` | `{ trxCassa, trxDataDal, trxDataAl, trxStatus, trxBraId }` | Emitted when search button is clicked with normalized dates |

## Date Normalization

The component automatically normalizes dates before emitting:
- **trxDataDal**: Set to 00:00:00.000 (start of day)
- **trxDataAl**: Set to 23:59:59.999 (end of day)

This ensures consistent date range queries that include full days.
