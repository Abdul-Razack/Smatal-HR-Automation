import { FieldDefinitionList } from '@/modules/master/components/list/FieldDefinitionList';
import { FieldGroupList } from '@/modules/master/components/list/FieldGroupList';

export default function FieldRegistryPage() {
  return (
    <div className="space-y-12">
      <FieldDefinitionList />
      <hr />
      <FieldGroupList />
    </div>
  );
}
