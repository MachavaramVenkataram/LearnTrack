"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import {
  getRetrainingStatus,
  checkRetrainingEligibility,
  runRetraining,
  getRetrainingHistory,
  promoteCandidateModel,
  rollbackModel,
  getModelAuditLog,
  RetrainingStatusResponse,
  RetrainingCheckResponse,
  RetrainingRunResponse,
  AuditEventItem,
} from "@/lib/api/mlOps";
import {
  RetrainingHeader,
  RetrainingHealthHero,
  RetrainingPolicyStrip,
  ModelLifecyclePipeline,
  CandidateModelsWorkspace,
  RetrainingPipelineTable,
  LifecycleAuditTrail,
  EligibilityCheckModal,
  StartRetrainingModal,
  PromoteModelModal,
  RollbackModelModal,
  CandidateDetailsDrawer,
  AuditEventDetailModal,
  RetrainingSkeleton,
} from "@/components/retraining";

export default function RetrainingDashboardPage() {
  const { showToast } = useToast();

  const [statusData, setStatusData] = useState<RetrainingStatusResponse | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEventItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Dry-run eligibility modal
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [dryRunResult, setDryRunResult] = useState<RetrainingCheckResponse | null>(null);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState<boolean>(false);

  // Retrain execution modal
  const [isRetrainModalOpen, setIsRetrainModalOpen] = useState<boolean>(false);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  // Candidate detail drawer
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Promotion modal
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState<boolean>(false);
  const [selectedCandidateVersion, setSelectedCandidateVersion] = useState<string>("");
  const [isSubmittingPromotion, setIsSubmittingPromotion] = useState<boolean>(false);

  // Rollback modal
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);
  const [isSubmittingRollback, setIsSubmittingRollback] = useState<boolean>(false);

  // Audit event detail modal
  const [selectedAuditEvent, setSelectedAuditEvent] = useState<AuditEventItem | null>(null);

  const loadData = useCallback(
    async (isManualRefresh: boolean = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const [st, hist, audits] = await Promise.all([
          getRetrainingStatus(),
          getRetrainingHistory(),
          getModelAuditLog(),
        ]);
        setStatusData(st);
        setHistory(hist);
        setAuditLog(audits);
      } catch (err: any) {
        console.error("Failed to load retraining status:", err);
        showToast(
          "Error loading retraining status",
          err.message || "Failed to contact ML service",
          "error"
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Handle dry-run pre-flight check
  const handleDryRunCheck = async (trigger: string = "manual") => {
    setIsCheckingEligibility(true);
    try {
      const check = await checkRetrainingEligibility(trigger);
      setDryRunResult(check);
      setIsEligibilityModalOpen(true);
      showToast(
        check.eligible ? "Eligible for Retraining" : "Retraining Requirements Not Met",
        check.reason,
        check.eligible ? "success" : "info"
      );
    } catch (err: any) {
      showToast(
        "Eligibility Check Failed",
        err.message || "Failed to evaluate eligibility",
        "error"
      );
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Handle retraining trigger
  const handleTriggerRetraining = async (trigger: string = "manual", force: boolean = false) => {
    setIsRetraining(true);
    try {
      const runRes = await runRetraining(trigger, force);
      await loadData(false);
      showToast(
        "Candidate Model Generated",
        `Candidate model ${runRes.candidate_version || "version"} generated with status ${runRes.status}. Review comparative metrics before explicit promotion.`,
        "success"
      );
    } catch (err: any) {
      showToast(
        "Retraining Pipeline Failed",
        err.message || "Candidate retraining pipeline encountered an error",
        "error"
      );
    } finally {
      setIsRetraining(false);
    }
  };

  // Handle promote flow
  const handleOpenPromote = (candVersion: string) => {
    setSelectedCandidateVersion(candVersion);
    setIsPromoteModalOpen(true);
  };

  const handleConfirmPromotion = async (promoterName: string, reason: string) => {
    if (!selectedCandidateVersion) return;
    setIsSubmittingPromotion(true);
    try {
      const res = await promoteCandidateModel(
        selectedCandidateVersion,
        promoterName.trim() || "admin",
        reason.trim() || "Explicit manual promotion"
      );
      setIsPromoteModalOpen(false);
      await loadData(false);
      showToast(
        "Candidate Model Promoted to Production",
        `Version ${res.promoted_version} is now the active production model. Previous version ${res.previous_version} is safely archived.`,
        "success"
      );
    } catch (err: any) {
      showToast("Promotion Failed", err.message || "Failed to promote candidate model", "error");
    } finally {
      setIsSubmittingPromotion(false);
    }
  };

  // Handle rollback flow
  const handleConfirmRollback = async (targetVersion: string, reason: string) => {
    if (!targetVersion) return;
    setIsSubmittingRollback(true);
    try {
      const res = await rollbackModel(
        targetVersion,
        "admin",
        reason.trim() || "Rollback to designated baseline"
      );
      setIsRollbackModalOpen(false);
      await loadData(false);
      showToast(
        "Model Rolled Back Successfully",
        `Production restored to v${res.active_version}. Previous model archived.`,
        "success"
      );
    } catch (err: any) {
      showToast("Rollback Failed", err.message || "Failed to rollback model", "error");
    } finally {
      setIsSubmittingRollback(false);
    }
  };

  if (isLoading && !statusData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <RetrainingSkeleton />
      </div>
    );
  }

  const prod = statusData?.active_production_model;
  const candidates = statusData?.candidates_available || [];
  const prodRmse = prod?.test_rmse || 7.677;

  // Staggered motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-6 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Header (Model Lifecycle Kicker, Status Badge, Action Buttons) */}
        <motion.div variants={itemVariants}>
          <RetrainingHeader
            onCheckEligibility={() => handleDryRunCheck("manual")}
            onOpenRetrainModal={() => setIsRetrainModalOpen(true)}
            onRefresh={() => loadData(true)}
            isCheckingEligibility={isCheckingEligibility}
            isRetraining={isRetraining}
            isRefreshing={isRefreshing}
            productionActive={Boolean(prod?.model_name)}
            productionModelName={prod?.model_type || prod?.model_name}
          />
        </motion.div>

        {/* 2. Retraining Status Hero: 4 Health Cards (Section 6, 7, 8, 9, 10) */}
        <motion.section variants={itemVariants} aria-label="Model Health Overview">
          <RetrainingHealthHero statusData={statusData} />
        </motion.section>

        {/* 3. Retraining Policy Strip (Section 11) */}
        <motion.section variants={itemVariants} aria-label="Controlled Retraining Policy">
          <RetrainingPolicyStrip />
        </motion.section>

        {/* 4. Visual Model Lifecycle Nodes (Section 45) */}
        <motion.section variants={itemVariants} aria-label="Model Lifecycle Pipeline">
          <ModelLifecyclePipeline currentStage="candidate" />
        </motion.section>

        {/* 5. Candidate Model Workspace (Section 12, 13, 14, 15, 30, 31) */}
        <motion.section variants={itemVariants} aria-label="Model Candidates Registry">
          <CandidateModelsWorkspace
            candidates={candidates}
            productionRmse={prodRmse}
            onOpenPromote={handleOpenPromote}
            onOpenRollback={() => setIsRollbackModalOpen(true)}
            onOpenDetails={(cand) => setSelectedCandidate(cand)}
            onGenerateCandidate={() => handleTriggerRetraining("manual", true)}
            isRetraining={isRetraining}
          />
        </motion.section>

        {/* 6. Retraining Pipeline Runs Table (Section 18, 19, 20, 21) */}
        <motion.section variants={itemVariants} aria-label="Retraining Execution History">
          <RetrainingPipelineTable
            history={history}
            onSelectRun={(run) => {
              if (run.candidate_metrics) {
                setSelectedCandidate({
                  candidate_version: run.candidate_version,
                  model_type: run.candidate_model_type,
                  dataset_version: run.dataset_version,
                  created_at: run.started_at,
                  test_metrics: run.candidate_metrics.test,
                  validation_metrics: run.candidate_metrics.validation,
                  cv_metrics: run.candidate_metrics.cv,
                  benchmarks: {},
                });
              }
            }}
          />
        </motion.section>

        {/* 7. ML Lifecycle Audit Trail (Section 22, 23, 24) */}
        <motion.section variants={itemVariants} aria-label="Lifecycle Governance Audit Log">
          <LifecycleAuditTrail
            auditLog={auditLog}
            onSelectEvent={(ev) => setSelectedAuditEvent(ev)}
          />
        </motion.section>
      </motion.div>

      {/* Modals & Inspection Drawers */}

      {/* Eligibility Pre-Flight Check Modal */}
      <EligibilityCheckModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        result={dryRunResult}
        onProceedToRetrain={() => setIsRetrainModalOpen(true)}
      />

      {/* Start Retraining Pipeline Modal */}
      <StartRetrainingModal
        isOpen={isRetrainModalOpen}
        onClose={() => setIsRetrainModalOpen(false)}
        onConfirmRetrain={handleTriggerRetraining}
        isRetraining={isRetraining}
        productionModelName={prod?.model_type || prod?.model_name || "Linear Regression (Ridge)"}
        datasetVersion={prod?.dataset_version || "1.0.0"}
      />

      {/* Explicit Model Promotion Gate Modal */}
      <PromoteModelModal
        isOpen={isPromoteModalOpen}
        onClose={() => setIsPromoteModalOpen(false)}
        candidateVersion={selectedCandidateVersion}
        candidateModelType={
          candidates.find((c) => c.candidate_version === selectedCandidateVersion)?.model_type ||
          "Linear Regression (Ridge)"
        }
        candidateRmse={
          candidates.find((c) => c.candidate_version === selectedCandidateVersion)?.test_metrics
            ?.rmse ?? prodRmse
        }
        productionRmse={prodRmse}
        onConfirmPromotion={handleConfirmPromotion}
        isSubmitting={isSubmittingPromotion}
      />

      {/* Model Rollback Control Modal */}
      <RollbackModelModal
        isOpen={isRollbackModalOpen}
        onClose={() => setIsRollbackModalOpen(false)}
        currentVersion={prod?.model_version || "candidate-8963bdf8"}
        defaultTargetVersion="1"
        onConfirmRollback={handleConfirmRollback}
        isSubmitting={isSubmittingRollback}
      />

      {/* Candidate Deep Technical Inspection Drawer */}
      <CandidateDetailsDrawer
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onPromote={(ver) => {
          setSelectedCandidate(null);
          handleOpenPromote(ver);
        }}
      />

      {/* Audit Event Detail Inspector Modal */}
      <AuditEventDetailModal
        isOpen={Boolean(selectedAuditEvent)}
        onClose={() => setSelectedAuditEvent(null)}
        event={selectedAuditEvent}
      />
    </div>
  );
}
