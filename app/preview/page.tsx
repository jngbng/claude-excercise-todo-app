"use client";

/**
 * 컴포넌트 프리뷰 페이지
 * - DB 연결 없이 목 데이터로 개별 컴포넌트를 갤러리 형식으로 렌더링한다.
 * - Phase별 프론트엔드 컴포넌트 개발이 끝날 때마다 해당 섹션을 채워 나간다.
 * - /docs/COMPONENT_SPEC.md의 컴포넌트 계층을 기준으로 섹션을 나눈다.
 */

import { useState } from "react";
import { Button } from "@/client/components/Button";
import { Modal } from "@/client/components/Modal";
import { ConfirmDialog } from "@/client/components/ConfirmDialog";
import { Badge } from "@/client/components/Badge";

type PreviewSectionProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

const PreviewSection = ({ title, description, children }: PreviewSectionProps) => (
  <section className="mb-12">
    <h2 className="mb-1 text-lg font-semibold">{title}</h2>
    {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
    <div className="rounded-lg border border-dashed border-gray-300 p-6">
      {children ?? <p className="text-sm text-gray-400">아직 구현된 컴포넌트가 없습니다.</p>}
    </div>
  </section>
);

const PreviewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-2xl font-bold">컴포넌트 프리뷰</h1>

      {/* Phase 1: TicketCard, Column 등 */}
      <PreviewSection title="Phase 1">
        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Button variants</p>
          <div className="flex items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Button isLoading</p>
          <div className="flex items-center gap-3">
            <Button isLoading>Primary</Button>
            <Button variant="secondary" isLoading>
              Secondary
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Button sizes</p>
          <div className="flex items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Badge priority</p>
          <div className="flex items-center gap-3">
            <Badge priority="LOW" />
            <Badge priority="MEDIUM" />
            <Badge priority="HIGH" />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Modal</p>
          <Button onClick={() => setIsModalOpen(true)}>Modal 열기</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <p className="mb-4">Modal 내용입니다.</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
          </Modal>
        </div>

        <div>
          <p className="mb-2 text-sm text-text-primary">ConfirmDialog</p>
          <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
            삭제하기
          </Button>
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onConfirm={() => setIsConfirmOpen(false)}
            onCancel={() => setIsConfirmOpen(false)}
          />
        </div>
      </PreviewSection>

      {/* Phase 2: BoardHeader, FilterBar 등 */}
      <PreviewSection title="Phase 2" />

      {/* Phase 3: TicketModal, TicketForm 등 */}
      <PreviewSection title="Phase 3" />
    </main>
  );
};

export default PreviewPage;
