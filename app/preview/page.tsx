"use client";

/**
 * 컴포넌트 프리뷰 페이지
 * - DB 연결 없이 목 데이터로 개별 컴포넌트를 갤러리 형식으로 렌더링한다.
 * - Phase별 프론트엔드 컴포넌트 개발이 끝날 때마다 해당 섹션을 채워 나간다.
 * - /docs/COMPONENT_SPEC.md의 컴포넌트 계층을 기준으로 섹션을 나눈다.
 */

import { useEffect, useState } from "react";
import { Button } from "@/client/components/ui/Button";
import { Modal } from "@/client/components/ui/Modal";
import { ConfirmDialog } from "@/client/components/ui/ConfirmDialog";
import { PriorityBadge } from "@/client/components/ui/PriorityBadge";
import { DueDateBadge } from "@/client/components/ui/DueDateBadge";
import { SearchInput } from "@/client/components/SearchInput";
import { CreateTicketButton } from "@/client/components/CreateTicketButton";
import { DeleteButton } from "@/client/components/DeleteButton";
import { TicketDetailView } from "@/client/components/TicketDetailView";

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

/**
 * document.body의 실제 class 변화를 관찰해 Modal이 body-scroll-locked를
 * 제대로 붙였다 뗐다 하는지 화면에서 바로 확인할 수 있게 한다.
 * (Modal의 내부 state가 아니라 실제 DOM을 관찰 — 배선이 잘못돼도 잡아낼 수 있도록)
 */
const useBodyScrollLocked = () => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const update = () => setIsLocked(document.body.classList.contains("body-scroll-locked"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isLocked;
};

const PreviewPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [createClickCount, setCreateClickCount] = useState(0);
  const [deleteClickCount, setDeleteClickCount] = useState(0);
  const isBodyScrollLocked = useBodyScrollLocked();

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div
        data-testid="body-scroll-lock-indicator"
        className={`fixed right-4 top-4 z-50 rounded-full px-3 py-1 text-xs font-medium shadow-md ${
          isBodyScrollLocked ? "bg-danger text-white" : "bg-white text-text-secondary"
        }`}
      >
        {isBodyScrollLocked ? "🔒 배경 스크롤 잠김" : "🔓 배경 스크롤 가능"}
      </div>

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
          <p className="mb-2 text-sm text-text-primary">
            Button onClick 동작 확인 (클릭 시 카운트 증가)
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={() => setClickCount((count) => count + 1)}>클릭해보세요</Button>
            <span data-testid="click-count" className="text-sm text-text-secondary">
              클릭 횟수: {clickCount}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">PriorityBadge priority</p>
          <div className="flex items-center gap-3">
            <PriorityBadge priority="LOW" />
            <PriorityBadge priority="MEDIUM" />
            <PriorityBadge priority="HIGH" />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">DueDateBadge (over-due / before-due)</p>
          <div className="flex items-center gap-3">
            <DueDateBadge dueDate="2020-01-01" isOverdue={true} />
            <DueDateBadge dueDate="2099-01-01" isOverdue={false} />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">Modal</p>
          <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            <li>ESC 키를 눌러 닫히는지 확인</li>
            <li>모달 바깥(반투명 영역) 클릭 시 닫히고, 모달 내부 클릭 시 닫히지 않는지 확인</li>
            <li>
              모달을 연 상태에서 마우스 휠/트랙패드로 배경을 스크롤해보세요 — 화면 오른쪽 위
              배지가 🔒로 바뀌며 배경 스크롤이 잠겨야 합니다
            </li>
          </ul>
          <Button onClick={() => setIsModalOpen(true)}>Modal 열기</Button>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <p className="mb-4">Modal 내용입니다.</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              닫기
            </Button>
          </Modal>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-text-primary">
            body 스크롤 잠금 확인용 더미 콘텐츠 (아래로 스크롤 가능해야 정상)
          </p>
          <div
            data-testid="scroll-lock-filler"
            className="flex h-[140vh] flex-col justify-between rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-400"
          >
            <span>↓ 이 영역이 페이지를 세로로 길게 만들어 스크롤을 발생시킵니다</span>
            <span>위 &quot;Modal 열기&quot;로 모달을 연 상태에서 여기까지 스크롤을 시도해보세요</span>
            <span>모달이 열려 있으면 배경(body)이 스크롤되지 않아야 합니다 ↑</span>
          </div>
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

        <div>
          <p className="mb-2 text-sm text-text-primary">
            SearchInput (MVP: 비활성 placeholder)
          </p>
          <SearchInput />
        </div>

        <div>
          <p className="mb-2 text-sm text-text-primary">
            CreateTicketButton (클릭 시 카운트 증가)
          </p>
          <div className="flex items-center gap-3">
            <CreateTicketButton onClick={() => setCreateClickCount((count) => count + 1)} />
            <span data-testid="create-click-count" className="text-sm text-text-secondary">
              클릭 횟수: {createClickCount}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-text-primary">DeleteButton (클릭 시 카운트 증가)</p>
          <div className="flex items-center gap-3">
            <DeleteButton onClick={() => setDeleteClickCount((count) => count + 1)} />
            <span data-testid="delete-click-count" className="text-sm text-text-secondary">
              클릭 횟수: {deleteClickCount}
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-text-primary">
            TicketDetailView (읽기 전용 필드 — null이면 &quot;-&quot; 표시)
          </p>
          <TicketDetailView
            status="IN_PROGRESS"
            startedAt="2026-08-01T09:00:00.000Z"
            completedAt={null}
            createdAt="2026-07-30T12:00:00.000Z"
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
