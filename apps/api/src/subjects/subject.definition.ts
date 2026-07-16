export abstract class SubjectDefinition {
  abstract readonly code: string;
  abstract readonly displayName: string;
  abstract readonly csvColumn: string;
  abstract readonly dbField: string;
  abstract readonly isEnabled: boolean;
  abstract readonly examGroups: string[];
}
