
import PartnerCard from "./PartnerCard";

interface PartnerListSectionProps {
  partners: any[];
  onWithdraw: (partner: any) => void;
  onDelete: (id: string) => void;
  onWithdrawShare: (partner: any) => void;
  getPartnerStats: (partner: any) => { withdrawals: number; remaining_share: number };
}

export default function PartnerListSection({
  partners,
  onWithdraw,
  onDelete,
  onWithdrawShare,
  getPartnerStats
}: PartnerListSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {partners.map((partner) => {
        const stats = getPartnerStats(partner);
        return (
          <PartnerCard
            key={partner.id}
            partner={{
              ...partner,
              withdrawals: stats.withdrawals,
              remaining_share: stats.remaining_share,
            }}
            onWithdraw={onWithdraw}
            onDelete={onDelete}
            onWithdrawShare={onWithdrawShare}
          />
        );
      })}
    </div>
  );
}
