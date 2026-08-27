import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal, ShieldCheck, Clock, XCircle, Building2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector((store) => store.company);
  const [filterCompany, setFilterCompany] = useState(companies || []);
  const navigate = useNavigate();

  useEffect(() => {
    if (!companies) return;
    const filtered = companies.filter((company) => {
      if (!searchCompanyByText) return true;
      return company.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());
    });
    setFilterCompany(filtered);
  }, [companies, searchCompanyByText]);

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800 p-4 shadow-sm transition-colors">
      <Table>
        <TableCaption className="text-xs text-gray-500 dark:text-gray-400">
          Partner Companies & Institutional Verification Status
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-300">Company Logo</TableHead>
            <TableHead className="dark:text-gray-300">Company Name</TableHead>
            <TableHead className="dark:text-gray-300">TPO Verification Status</TableHead>
            <TableHead className="dark:text-gray-300">Location</TableHead>
            <TableHead className="dark:text-gray-300">Created Date</TableHead>
            <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!filterCompany || filterCompany.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-medium">
                No registered companies found.
              </TableCell>
            </TableRow>
          ) : (
            filterCompany.map((company) => {
              const compId = company.id || company._id;
              const isApproved = company.status === "APPROVED" || company.isApproved;
              const isPending = company.status === "PENDING";
              const isRejected = company.status === "REJECTED";

              return (
                <TableRow key={compId} className="dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <Avatar className="w-10 h-10 border rounded-2xl">
                      <AvatarImage src={company.logo || "https://github.com/shadcn.png"} />
                    </Avatar>
                  </TableCell>

                  <TableCell className="font-bold text-gray-900 dark:text-white">
                    {company.name}
                  </TableCell>

                  <TableCell>
                    {isApproved ? (
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5" /> APPROVED
                      </Badge>
                    ) : isPending ? (
                      <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                        <Clock className="w-3.5 h-3.5" /> PENDING VERIFICATION
                      </Badge>
                    ) : isRejected ? (
                      <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-extrabold text-xs flex items-center gap-1 w-fit">
                        <XCircle className="w-3.5 h-3.5" /> REJECTED
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 font-bold text-xs">
                        {company.status || "UNVERIFIED"}
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                    {company.location || "Pan-India"}
                  </TableCell>

                  <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                    {company.createdAt ? String(company.createdAt).split("T")[0] : "Recently"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger className="p-1.5 rounded-xl border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <MoreHorizontal className="w-4 h-4 cursor-pointer text-gray-700 dark:text-gray-300" />
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-2 dark:bg-gray-900 dark:border-gray-800">
                        <button
                          onClick={() => navigate(`/admin/companies/${compId}`)}
                          className="flex items-center gap-2 w-full text-xs font-bold px-2 py-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-600 dark:text-purple-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Profile</span>
                        </button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
