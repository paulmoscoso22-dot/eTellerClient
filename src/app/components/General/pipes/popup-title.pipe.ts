import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'popupTitle',
  standalone: true,
  pure: true,
})
export class PopupTitlePipe implements PipeTransform {
  /**
   * Returns the popup title based on the current mode.
   *
   * @param mode   'new' | 'view' | 'edit' — or a boolean (true = 'edit', false = 'new')
   * @param newTitle  Title to show when creating a new record (e.g. 'Nuovo Tipo Device')
   * @param entity    Entity label used in edit/view titles  (e.g. 'Tipo Device')
   * @param id        Optional record id appended when editing or viewing
   */
  transform(
    mode: 'new' | 'view' | 'edit' | boolean,
    newTitle: string,
    entity: string,
    id?: string | number | null
  ): string {
    const resolved = mode === true ? 'edit' : mode === false ? 'new' : mode;
    const idSuffix = id != null ? ` — ${id}` : '';
    switch (resolved) {
      case 'view': return `Dettaglio ${entity}${idSuffix}`;
      case 'edit': return `Modifica ${entity}${idSuffix}`;
      default:     return newTitle;
    }
  }
}
