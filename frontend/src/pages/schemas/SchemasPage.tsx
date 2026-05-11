// src/pages/schemas/SchemasPage.tsx
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStores } from "../../hooks/useStores";
import {
  PageContainer,
  PageHeader,
  PageTitle,
  SchemasGrid,
  SchemaCard,
  SchemaCardHeader,
  SchemaNameText,
  SchemaCardDescription,
  SchemaCardDate,
  SchemaCardStats,
  StatItem,
  StatValue,
  StatLabel,
  SchemaCardFooter,
  SchemaCardActions,
  DraftBadge,
  ValidationBadge,
  EmptyState,
  LoadingState,
} from "./Schemas.styles";
import SchemaService from "../../services/schema.service";
import { SchemaSummary, Button, Dialog } from "../../shared";

const schemaService = new SchemaService();

const SchemasPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const { schemaStore, draftStore } = useStores();
  const [schemas, setSchemas] = useState<SchemaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSchema, setDeletingSchema] = useState<SchemaSummary | null>(null);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setLoading(true);
    try {
      const allSchemas = await schemaService.getAllSchemas();
      const schemasWithDraftInfo = allSchemas.map(schema => ({
        ...schema,
        hasDraft: draftStore.hasDraft(schema.id),
        draftValidation: draftStore.getDraftById(schema.id)?.lastValidationAt,
      }));
      setSchemas(schemasWithDraftInfo);
      schemaStore.setSchemas(allSchemas);
    } catch (error) {
      console.error("Failed to load schemas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Создание схемы сразу с ID от бэка
  const handleCreateSchema = async () => {
    try {
      const newSchema = await schemaService.createSchema("Новая схема", "", false);
      schemaStore.addSchema(newSchema);
      // Сразу переходим в редактор с реальным ID
      navigate(`/editor/${newSchema.id}`);
    } catch (error) {
      console.error("Failed to create schema:", error);
      alert("Ошибка при создании схемы");
    }
  };

  const handleOpenSchema = async (schemaId: string) => {
    console.log("Opening schema:", schemaId);
    navigate(`/editor/${schemaId}`);
  };

  const handleDeleteSchema = async (schemaId: string) => {
    try {
      await schemaService.deleteSchema(schemaId);
      setSchemas(prev => prev.filter(s => s.id !== schemaId));
      schemaStore.removeSchema(schemaId);
    } catch (error) {
      console.error("Failed to delete schema:", error);
    }
    setDeletingSchema(null);
  };

  const handleShowHistory = (schemaId: string) => {
    console.log("Showing history for schema:", schemaId);
    alert(`История симуляций для схемы ${schemaId} (в разработке)`);
  };

  const getDraftStatus = (schemaId: string) => {
    const draft = draftStore.getDraftById(schemaId);
    if (draft && draft.hasUnsavedChanges) {
      return { hasDraft: true, hasChanges: true };
    }
    if (draft) {
      return { hasDraft: true, hasChanges: false };
    }
    return { hasDraft: false, hasChanges: false };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingState>Загрузка ваших схем...</LoadingState>;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Мои схемы</PageTitle>
        <Button onClick={handleCreateSchema}>+ Новая схема</Button>
      </PageHeader>

      {schemas.length === 0 ? (
        <EmptyState>
          <span>📁</span>
          <p>У вас пока нет схем</p>
          <Button onClick={handleCreateSchema}>Создать первую схему</Button>
        </EmptyState>
      ) : (
        <SchemasGrid>
          {schemas.map((schema) => {
            const { hasDraft, hasChanges } = getDraftStatus(schema.id);
            
            return (
              <SchemaCard key={schema.id}>
                <SchemaCardHeader>
                  <div style={{ flex: 1 }}>
                    <SchemaNameText>
                      {schema.name}
                    </SchemaNameText>
                    {schema.description && (
                      <SchemaCardDescription>
                        {schema.description}
                      </SchemaCardDescription>
                    )}
                  </div>
                  <SchemaCardDate>
                    {formatDate(schema.updatedAt)}
                  </SchemaCardDate>
                </SchemaCardHeader>

                <SchemaCardStats>
                  <StatItem>
                    <StatValue>{schema.devicesCount || 0}</StatValue>
                    <StatLabel>Устройств</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{schema.cablesCount || 0}</StatValue>
                    <StatLabel>Кабелей</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{schema.connectionsCount || 0}</StatValue>
                    <StatLabel>Связей</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{schema.isPublic ? "🌍" : "🔒"}</StatValue>
                    <StatLabel>{schema.isPublic ? "Публичная" : "Приватная"}</StatLabel>
                  </StatItem>
                </SchemaCardStats>

                <SchemaCardFooter>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {hasDraft && (
                      <DraftBadge $hasChanges={hasChanges}>
                        {hasChanges ? "📝 Черновик" : "💾 Сохранено"}
                      </DraftBadge>
                    )}
                    {draftStore.getDraftById(schema.id)?.lastValidationAt && (
                      <ValidationBadge $isValid={true}>
                        ✅ Валидация пройдена
                      </ValidationBadge>
                    )}
                  </div>
                  <SchemaCardActions>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleOpenSchema(schema.id)}
                    >
                      Открыть
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleShowHistory(schema.id)}
                    >
                      📊 История
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setDeletingSchema(schema)}
                      style={{ color: "#ef4444" }}
                    >
                      Удалить
                    </Button>
                  </SchemaCardActions>
                </SchemaCardFooter>
              </SchemaCard>
            );
          })}
        </SchemasGrid>
      )}

      {deletingSchema && (
        <Dialog
          isOpen={!!deletingSchema}
          onClose={() => setDeletingSchema(null)}
          onConfirm={() => handleDeleteSchema(deletingSchema.id)}
          title="Удаление схемы"
          message={`Вы уверены, что хотите удалить схему "${deletingSchema.name}"? Это действие нельзя отменить.`}
          confirmText="Удалить"
          type="danger"
        />
      )}
    </PageContainer>
  );
});

export default SchemasPage;
