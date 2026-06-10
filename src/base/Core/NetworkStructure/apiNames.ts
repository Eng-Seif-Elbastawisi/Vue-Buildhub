// import { baseUrl } from "./baseUrl";

// class ApiNames {
//   public baseUrl = baseUrl;
//   //Website
//   public websitePrefix = "organization/";
//   //login_employee
//   public loginEmployee = this.baseUrl + this.websitePrefix + "login_employee";
//   public logoutEmployee = this.baseUrl + this.websitePrefix + "logout_employee";
//   // Country
//   public Country = this.baseUrl + this.websitePrefix + "fetch_country";
//   public AddCountry = this.baseUrl + this.websitePrefix + "store_country";
//   public EditCountry = this.baseUrl + this.websitePrefix + "update_country";
//   public ShowCountry = this.baseUrl + this.websitePrefix + "show_country";
//   public DeleteCountry = this.baseUrl + this.websitePrefix + "delete_country";
//   // request_type
//   public RequestTypeIndex =
//     this.baseUrl + this.websitePrefix + "fetch_request_tool_types";
//   public AddRequestType =
//     this.baseUrl + this.websitePrefix + "store_request_tool_types";
//   public EditRequestType =
//     this.baseUrl + this.websitePrefix + "update_request_type";
//   public ShowRequestType =
//     this.baseUrl + this.websitePrefix + "show_request_type";
//   public DeleteRequestType =
//     this.baseUrl + this.websitePrefix + "delete_request_type";

//   // Fetch Packedge Project
//   public IndexPackedge =
//     this.baseUrl + this.websitePrefix + "full_package_permit_for_project";

//   public StorePackege =
//     this.baseUrl + this.websitePrefix + "store_package_task";

//   public FetchPackege =
//     this.baseUrl + this.websitePrefix + "fetch_sent_package_tasks";

//   // SetAllAbsenceTodayApiService
//   public SetAllAbsenceTodayApiService =
//     this.baseUrl + this.websitePrefix + "set_all_absence_today";

//   // GetAttendanceStateApiService
//   public GetAttendanceStateApiService =
//     this.baseUrl + this.websitePrefix + "get_attendance_state";

//   // ShowEmployeeSmartTrackingReport
//   public ShowEmployeeSmartTrackingReport =
//     this.baseUrl + this.websitePrefix + "fetch_employee_smart_tracking_report";

//   // activity
//   public ActivityIndex =
//     this.baseUrl + this.websitePrefix + "fetch_permit_activity";
//   public AddActivity =
//     this.baseUrl + this.websitePrefix + "store_permit_activity";
//   public EditActivity =
//     this.baseUrl + this.websitePrefix + "update_permit_activity";
//   public ShowActivity =
//     this.baseUrl + this.websitePrefix + "show_permit_activity";
//   public DeleteActivity =
//     this.baseUrl + this.websitePrefix + "delete_permit_activity";

//   public UpdateTimeZone =
//     this.baseUrl + this.websitePrefix + "update_employee_time_zone";

//   public FetchSingleProject =
//     this.baseUrl + this.websitePrefix + "fetch_single_project";

//   // SimpleClientRequestDashboard
//   public SimpleClientRequestIndex =
//     this.baseUrl + this.websitePrefix + "fetch_simple_client_request";
//   public AddSimpleClientRequest =
//     this.baseUrl + this.websitePrefix + "store_simple_client_request";
//   public EditSimpleClientRequest =
//     this.baseUrl + this.websitePrefix + "update_simple_client_request";
//   public ShowSimpleClientRequest =
//     this.baseUrl + this.websitePrefix + "show_simple_client_request";
//   public DeleteSimpleClientRequest =
//     this.baseUrl + this.websitePrefix + "delete_simple_client_request";

//   public ChangeSimpleClientRequestStatus =
//     this.baseUrl + this.websitePrefix + "change_simple_client_status";

//   public GetPermitsUponDepartmentsAndAuthorty =
//     this.baseUrl +
//     this.websitePrefix +
//     "get_permits_upon_departments_and_authorty";

//   public FetchPlanDetection =
//     "https://aiplan.orbitconsults.com/api/fetchPlanDetection";

//   // FetchHistoryWaitingDocument
//   public FetchHistoryWaitingDocument =
//     this.baseUrl + this.websitePrefix + "fetch_history_waiting_document";

//   // activityType
//   public ActivityTypeIndex =
//     this.baseUrl + this.websitePrefix + "fetch_activity_type";
//   public AddActivityType =
//     this.baseUrl + this.websitePrefix + "store_activity_type";
//   public EditActivityType =
//     this.baseUrl + this.websitePrefix + "update_activity_type";
//   public ShowActivityType =
//     this.baseUrl + this.websitePrefix + "show_activity_type";
//   public DeleteActivityType =
//     this.baseUrl + this.websitePrefix + "delete_activity_type";
//   // request_tools
//   public RequestToolsIndex =
//     this.baseUrl + this.websitePrefix + "fetch_request_tool_types";
//   public AddRequestTools =
//     this.baseUrl + this.websitePrefix + "store_request_tool_types";
//   // basic Data
//   public BasicDataIndex =
//     this.baseUrl + this.websitePrefix + "fetch_basic_data";
//   public AddBasicData = this.baseUrl + this.websitePrefix + "store_basic_data";
//   public EditBasicData =
//     this.baseUrl + this.websitePrefix + "update_basic_data";
//   public ShowBasicData = this.baseUrl + this.websitePrefix + "show_basic_data";
//   public DeleteBasicData =
//     this.baseUrl + this.websitePrefix + "delete_basic_data";

//   // authorty type
//   public AddAuthortyType =
//     this.baseUrl + this.websitePrefix + "store_authorty_stage";
//   public EditAuthortyType =
//     this.baseUrl + this.websitePrefix + "update_authorty_stage";
//   public ShowAuthortyType =
//     this.baseUrl + this.websitePrefix + "show_authorty_stage";
//   public DeleteAuthortyType =
//     this.baseUrl + this.websitePrefix + "delete_authorty_stage";
//   public AuthortyTypeIndex =
//     this.baseUrl + this.websitePrefix + "fetch_authorty_stage";

//   //price_reference
//   public PriceReferenceIndex =
//     this.baseUrl + this.websitePrefix + "fetch_reference_offer";
//   public AddPriceReference =
//     this.baseUrl + this.websitePrefix + "store_reference_offer";
//   public EditPriceReference =
//     this.baseUrl + this.websitePrefix + "update_reference_offer";
//   public ShowPriceReference =
//     this.baseUrl + this.websitePrefix + "show_reference_offer";
//   public DeletePriceReference =
//     this.baseUrl + this.websitePrefix + "delete_reference_offer";
//   // roles_contents
//   public RolesContentsIndex =
//     this.baseUrl + this.websitePrefix + "fetch_roles_contents";
//   public AddRolesContents =
//     this.baseUrl + this.websitePrefix + "store_roles_contents";
//   public EditRolesContents =
//     this.baseUrl + this.websitePrefix + "update_roles_contents";
//   public ShowRolesContents =
//     this.baseUrl + this.websitePrefix + "show_roles_contents";
//   public DeleteRolesContents =
//     this.baseUrl + this.websitePrefix + "delete_roles_contents";
//   // Resignation
//   public ResignationIndex =
//     this.baseUrl + this.websitePrefix + "fetch_request_tool_types";
//   public AddResignation =
//     this.baseUrl + this.websitePrefix + "store_request_tool_types";
//   public ChangeStatusResignation =
//     this.baseUrl + this.websitePrefix + "change_request_tool_type_status";
//   // home
//   public IndexHome =
//     this.baseUrl + this.websitePrefix + "get_project_statistics";
//   // liecensesType
//   public LicensesTypeIndex =
//     this.baseUrl + this.websitePrefix + "fetch_licenses_types";
//   public AddLicensesType =
//     this.baseUrl + this.websitePrefix + "store_licenses_types";
//   public EditLicensesType =
//     this.baseUrl + this.websitePrefix + "update_licenses_types";
//   public ShowLicensesType =
//     this.baseUrl + this.websitePrefix + "show_licenses_types";
//   public DeleteLicensesType =
//     this.baseUrl + this.websitePrefix + "delete_licenses_types";
//   // stages
//   public LicensesStageIndex = this.baseUrl + this.websitePrefix + "fetch_stage";
//   public AddLicensesStage = this.baseUrl + this.websitePrefix + "store_stage";
//   public EditLicensesStage = this.baseUrl + this.websitePrefix + "update_stage";
//   public ShowLicensesStage = this.baseUrl + this.websitePrefix + "show_stage";
//   public DeleteLicensesStage =
//     this.baseUrl + this.websitePrefix + "delete_stage";
//   public AttachmentTypesIndex =
//     this.baseUrl + this.websitePrefix + "fetch_attachment_type";
//   public AddAttachmentTypes =
//     this.baseUrl + this.websitePrefix + "store_attachment_type";
//   public EditAttachmentTypes =
//     this.baseUrl + this.websitePrefix + "update_attachment_type";

//   // attachment_types
//   public ShowAttachmentTypes =
//     this.baseUrl + this.websitePrefix + "show_attachment_type";
//   public DeleteAttachmentTypes =
//     this.baseUrl + this.websitePrefix + "delete_attachment_type";
//   // LegalDocuments
//   public LegalDocuments =
//     this.baseUrl + this.websitePrefix + "fetch_legal_document";
//   public AddLegalDocuments =
//     this.baseUrl + this.websitePrefix + "store_legal_document";
//   public EditLegalDocuments =
//     this.baseUrl + this.websitePrefix + "update_legal_document";
//   public ShowLegalDocuments =
//     this.baseUrl + this.websitePrefix + "show_legal_document";
//   public DeleteLegalDocuments =
//     this.baseUrl + this.websitePrefix + "delete_legal_document";
//   // OrganizationStructure
//   public OrganizationStructure =
//     this.baseUrl + this.websitePrefix + "fetch_organization_structure";
//   public AddOrganizationStructure =
//     this.baseUrl + this.websitePrefix + "store_organization_structure";
//   public EditOrganizationStructure =
//     this.baseUrl + this.websitePrefix + "update_organization_structure";
//   public ShowOrganizationStructure =
//     this.baseUrl + this.websitePrefix + "show_organization_structure";
//   public DeleteOrganizationStructure =
//     this.baseUrl + this.websitePrefix + "delete_organization_structure";
//   // officeCertifications
//   public OfficeCertifications =
//     this.baseUrl + this.websitePrefix + "fetch_office_certification";
//   public AddOfficeCertifications =
//     this.baseUrl + this.websitePrefix + "store_office_certification";
//   public EditOfficeCertifications =
//     this.baseUrl + this.websitePrefix + "update_office_certification";
//   public ShowOfficeCertifications =
//     this.baseUrl + this.websitePrefix + "show_office_certification";
//   public DeleteOfficeCertification =
//     this.baseUrl + this.websitePrefix + "delete_office_certification";
//   // AddOrbitProfile
//   public AddOrbitProfile =
//     this.baseUrl + this.websitePrefix + "update_or_create_organization_profile";
//   public ShowOrbitProfile =
//     this.baseUrl + this.websitePrefix + "show_organization_profile";
//   //Servcies
//   public services = this.baseUrl + this.websitePrefix + "fetch_services";
//   public AddServices = this.baseUrl + this.websitePrefix + "store_services";
//   public EditServices = this.baseUrl + this.websitePrefix + "update_service";
//   public ShowServices = this.baseUrl + this.websitePrefix + "show_service";
//   public DeleteServices = this.baseUrl + this.websitePrefix + "delete_service";
//   //Teams
//   public Team = this.baseUrl + this.websitePrefix + "fetch_web_employees";
//   public AddTeam = this.baseUrl + this.websitePrefix + "store_web_employees";
//   public EditTeam = this.baseUrl + this.websitePrefix + "update_web_employee";
//   public ShowTeam = this.baseUrl + this.websitePrefix + "show_web_employee";
//   public DeleteTeam = this.baseUrl + this.websitePrefix + "delete_web_employee";
//   //Scope
//   public Scope = this.baseUrl + this.websitePrefix + "fetch_scopes";
//   public AddScope = this.baseUrl + this.websitePrefix + "store_scopes";
//   public EditScope = this.baseUrl + this.websitePrefix + "update_scopes";
//   public ShowScope = this.baseUrl + this.websitePrefix + "show_scopes";
//   public DeleteScope = this.baseUrl + this.websitePrefix + "delete_scopes";
//   //opinions
//   public Opinion = this.baseUrl + this.websitePrefix + "fetch_client_opinions";
//   public AddOpinion =
//     this.baseUrl + this.websitePrefix + "store_client_opinions";
//   public EditOpinion =
//     this.baseUrl + this.websitePrefix + "update_client_opinion";
//   public ShowOpinion =
//     this.baseUrl + this.websitePrefix + "show_client_opinion";
//   public DeleteOpinion =
//     this.baseUrl + this.websitePrefix + "delete_client_opinion";
//   //Partners
//   public Partner = this.baseUrl + this.websitePrefix + "fetch_partners";
//   public addPartner = this.baseUrl + this.websitePrefix + "store_partners";
//   public EditPartner = this.baseUrl + this.websitePrefix + "update_partner";
//   public ShowPartner = this.baseUrl + this.websitePrefix + "show_partner";
//   public DeletePartner = this.baseUrl + this.websitePrefix + "delete_partner";
//   //CategoryBlog
//   public CategoryBlog =
//     this.baseUrl + this.websitePrefix + "fetch_blog_categories";
//   public AddCategoryBlog =
//     this.baseUrl + this.websitePrefix + "store_blog_categories";
//   public EditCategoryBlog =
//     this.baseUrl + this.websitePrefix + "update_blog_category";
//   public ShowCategoryBlog =
//     this.baseUrl + this.websitePrefix + "show_blog_category";
//   public DeleteCategoryBlog =
//     this.baseUrl + this.websitePrefix + "delete_blog_category";
//   //HashtagBlog
//   public HashtagBlog = this.baseUrl + this.websitePrefix + "fetch_hashtags";
//   public AddHashtagBlog = this.baseUrl + this.websitePrefix + "store_hashtags";
//   public EditHashtagBlog = this.baseUrl + this.websitePrefix + "update_hashtag";
//   public ShowHashtagBlog = this.baseUrl + this.websitePrefix + "show_hashtag";
//   public DeleteHashtagBlog =
//     this.baseUrl + this.websitePrefix + "delete_hashtag";
//   //blogs
//   public Blog = this.baseUrl + this.websitePrefix + "fetch_blogs";
//   public AddBlog = this.baseUrl + this.websitePrefix + "store_blogs";
//   public EditBlog = this.baseUrl + this.websitePrefix + "update_blog";
//   public ShowBlog = this.baseUrl + this.websitePrefix + "show_blog";
//   public DeleteBlog = this.baseUrl + this.websitePrefix + "delete_blog";
//   // Project Dashboard
//   public ProjectDashboard = this.baseUrl + this.websitePrefix + "fetch_project";
//   public AddProjectDashboard =
//     this.baseUrl + this.websitePrefix + "store_project";
//   public SortingTypeProjectDashboard =
//     this.baseUrl + this.websitePrefix + "sort_type_project";
//   public AddBuildingDataProject =
//     this.baseUrl + this.websitePrefix + "add_building_data_for_project";
//   public StoreChatbotContentDashboard =
//     this.baseUrl + this.websitePrefix + "store_chatbot_content";
//   public FetchProjectStatusCount =
//     this.baseUrl + this.websitePrefix + "fetch_project_status_count";
//   public EditProjectDashboard =
//     this.baseUrl + this.websitePrefix + "update_project";
//   public ShowProjectDashboard =
//     this.baseUrl + this.websitePrefix + "show_project";
//   public ShowFinalProjectDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_final_project";
//   public ChangeStatusRequestTools =
//     this.baseUrl + this.websitePrefix + "change_request_tool_type_status";
//   public AllRequestIndex =
//     this.baseUrl + this.websitePrefix + "fetch_request_tool_types";
//   public AddAllRequest =
//     this.baseUrl + this.websitePrefix + "store_request_tool_types";
//   public ChangeAllRequestStatus =
//     this.baseUrl + this.websitePrefix + "change_request_tool_type_status";
//   public ChangeApprovalDate =
//     this.baseUrl + this.websitePrefix + "change_confirmed_history_time";
//   public ChangeCreatedlDate =
//     this.baseUrl + this.websitePrefix + "change_project_created_date";
//   public AddChangeStatusRequestTypes =
//     this.baseUrl + this.websitePrefix + "change_request_tool_type_status";
//   public ChangeBasicDataMissing =
//     this.baseUrl + this.websitePrefix + "change_is_missing_for_general_data";
//   public ChangePermitStudyStatus =
//     this.baseUrl + this.websitePrefix + "custome_change_project_permit_status";
//   public HeadProjectDashboard =
//     this.baseUrl + this.websitePrefix + "show_simple_project";
//   public DeleteProjectDashboard =
//     this.baseUrl + this.websitePrefix + "delete_project";
//   public LockStudyDashboard =
//     this.baseUrl + this.websitePrefix + "change_project_is_lock_progress";
//   public PdfProjectDashboard = this.baseUrl + this.websitePrefix + "pdf_offer";
//   public SendWhatsappClient =
//     this.baseUrl + this.websitePrefix + "send_whatsapp_message_to_client_offer";

//   public SendEmailClient =
//     this.baseUrl + this.websitePrefix + "send_offer_project_email";

//   public SendWaitingDocumentEmail =
//     this.baseUrl + this.websitePrefix + "send_waiting_document_project_email";

//   public SendWhatsappEmployee =
//     this.baseUrl + this.websitePrefix + "send_whatsapp_message";
//   public SendWhatsappClientMessage =
//     this.baseUrl +
//     this.websitePrefix +
//     "send_whatsapp_message_waiting_document";
//   public SendWhatsappClientMessageTOWaiting =
//     this.baseUrl +
//     this.websitePrefix +
//     "send_whatsapp_message_to_client_offer_waiting_document";
//   public ReportProjectDashboard =
//     this.baseUrl + this.websitePrefix + "offer_reports";
//   public ReportClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "client_request_report";
//   public ShowProjectPlansDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_permits_depend_on_status";
//   public AddProjectPlanDashboard =
//     this.baseUrl + this.websitePrefix + "project_design_plan";
//   public changeProjectStudyUponProjectStudy =
//     this.baseUrl + this.websitePrefix + "start_work";
//   public unLockedProjectDashboard =
//     this.baseUrl + this.websitePrefix + "unlock_project_status";
//   public DeleteDepartmentProjectDashboard =
//     this.baseUrl + this.websitePrefix + "delete_project_department";
//   public DeletePermitsProjectDashboard =
//     this.baseUrl + this.websitePrefix + "delete_project_offer_Permits";
//   public ProjectSectionPermits =
//     this.baseUrl + this.websitePrefix + "show_project_offer_sections_permits";
//   public ProjectFloors =
//     this.baseUrl + this.websitePrefix + "fetch_project_floors";
//   public UpdateCostTimeOffer =
//     this.baseUrl + this.websitePrefix + "update_cost_time_offer";
//   public exportOffer = this.baseUrl + this.websitePrefix + "store_variation";
//   public fetchVariations =
//     this.baseUrl + this.websitePrefix + "fetch_variation";
//   public changeLastStatusVariationUponProject =
//     this.baseUrl +
//     this.websitePrefix +
//     "change_last_status_variation_upon_project";
//   public changeStatusVariationDashboard =
//     this.baseUrl + this.websitePrefix + "change_status_variation";
//   public historyProjectDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_project_history";
//   public changeProjectUponProject =
//     this.baseUrl + this.websitePrefix + "change_project_status";
//   public BackStageedProjectDashboard =
//     this.baseUrl + this.websitePrefix + "back_stage_project";
//   public ChangeOfferLpoToConfirmedProject =
//     this.baseUrl + this.websitePrefix + "change_offer_lpo_to_confirmed_project";
//   public UpdateMissingedProjectDashboard =
//     this.baseUrl + this.websitePrefix + "deleteAllMissingVersions";
//   public ShowProjectStudyDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_project_basic_data";
//   public StartStudyDashboard =
//     this.baseUrl + this.websitePrefix + "start_study";

//   public ResetProjectAuthortyDashboard =
//     this.baseUrl + this.websitePrefix + "reset_project_authorty";
//   public ResetProjectLicenseDashboard =
//     this.baseUrl + this.websitePrefix + "reset_project_license";
//   public ProjectDesignPermitsDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_project_design_permits";
//   public StoreProjectPreparePermitActivityDashboard =
//     this.baseUrl + this.websitePrefix + "store_project_prepare_permit_activity";
//   public FetchProjectPreparePermitActivityDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_project_prepare_permit_activity";
//   public DeleteProjectPreparePermitActivityDashboard =
//     this.baseUrl +
//     this.websitePrefix +
//     "delete_project_prepare_permit_activity";
//   public UpdateProjectPreparePermitActivityDashboard =
//     this.baseUrl +
//     this.websitePrefix +
//     "update_project_prepare_permit_activity";

//   public AddSuggestionToProjectDashboard =
//     this.baseUrl + this.websitePrefix + "add_suggestion_to_project";
//   public AddFollowUpToProjectDashboard =
//     this.baseUrl + this.websitePrefix + "store_client_follow_up";
//   //Project
//   public Project = this.baseUrl + this.websitePrefix + "fetch_web_projects";
//   public AddProject = this.baseUrl + this.websitePrefix + "store_web_projects";
//   public EditProject = this.baseUrl + this.websitePrefix + "update_web_project";
//   public ShowProject = this.baseUrl + this.websitePrefix + "show_web_project";
//   public DeleteProject =
//     this.baseUrl + this.websitePrefix + "delete_web_project";
//   public QuickSearch = this.baseUrl + this.websitePrefix + "quick_search";
//   public ShowOldProjectStudyDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_project_according_basic_data";
//   //Project Design
//   public DesignProject =
//     this.baseUrl + this.websitePrefix + "fetch_web_projects";
//   public AddDesignProject =
//     this.baseUrl + this.websitePrefix + "store_project_offer_permits_design";
//   public AddPrepareProject =
//     this.baseUrl + this.websitePrefix + "store_project_offer_permits_prepare";
//   public EditDesignProject =
//     this.baseUrl + this.websitePrefix + "update_web_project";
//   public ShowDesignProject =
//     this.baseUrl + this.websitePrefix + "show_project_offer_permits";
//   public DeleteDesignProject =
//     this.baseUrl + this.websitePrefix + "delete_web_project";
//   public ProjectSections =
//     this.baseUrl + this.websitePrefix + "show_project_offer_sections";
//   public ShowAvailableNumberStudyDashboard =
//     this.baseUrl + this.websitePrefix + "getAvailableSerials";
//   // AddSupervisionProject
//   public SupervisionProject =
//     this.baseUrl + this.websitePrefix + "fetch_web_projects";
//   public AddSupervisionProject =
//     this.baseUrl +
//     this.websitePrefix +
//     "store_project_offer_permits_supervision";
//   public EditSupervisionProject =
//     this.baseUrl + this.websitePrefix + "update_web_project";
//   public ShowSupervisionProject =
//     this.baseUrl + this.websitePrefix + "show_web_project";
//   public DeleteSupervisionProject =
//     this.baseUrl + this.websitePrefix + "delete_web_project";
//   // AddSupervisionProject
//   public TenderProject =
//     this.baseUrl + this.websitePrefix + "fetch_web_projects";
//   public AddTenderProject =
//     this.baseUrl + this.websitePrefix + "store_project_offer_tender";
//   public EditTenderProject =
//     this.baseUrl + this.websitePrefix + "update_web_project";
//   public ShowTenderProject =
//     this.baseUrl + this.websitePrefix + "show_web_project";
//   public DeleteTenderProject =
//     this.baseUrl + this.websitePrefix + "delete_web_project";
//   // fetch_client_methods
//   public ContactMethod =
//     this.baseUrl + this.websitePrefix + "fetch_client_methods";
//   public AddContactMethod =
//     this.baseUrl + this.websitePrefix + "store_client_method";
//   public EditContactMethod =
//     this.baseUrl + this.websitePrefix + "update_client_method";
//   public ShowContactMethod =
//     this.baseUrl + this.websitePrefix + "show_client_method";
//   public DeleteContactMethod =
//     this.baseUrl + this.websitePrefix + "delete_client_method";

//   public AuthortyProject =
//     this.baseUrl + this.websitePrefix + "fetch_web_projects";
//   public AddAuthortyProject =
//     this.baseUrl + this.websitePrefix + "store_project_offer_authority";
//   public EditAuthortyProject =
//     this.baseUrl + this.websitePrefix + "update_web_project";
//   public ShowAuthortyProject =
//     this.baseUrl + this.websitePrefix + "show_web_project";
//   public DeleteAuthortyProject =
//     this.baseUrl + this.websitePrefix + "delete_web_project";
//   public AddAddStudyProjectAttachmentsDashboard =
//     this.baseUrl + this.websitePrefix + "add_basic_to_attachment";
//   public ChangeSectionOrderDashboard =
//     this.baseUrl + this.websitePrefix + "change_project_department_order";
//   public ChangePermitOrder =
//     this.baseUrl +
//     this.websitePrefix +
//     "change_project_department_section_permit_order";
//   // roles
//   public Roles = this.baseUrl + this.websitePrefix + "fetch_roles";
//   public AddRole = this.baseUrl + this.websitePrefix + "store_role";
//   public EditRole = this.baseUrl + this.websitePrefix + "update_role";
//   public ShowRole = this.baseUrl + this.websitePrefix + "show_role";
//   public DeleteRole = this.baseUrl + this.websitePrefix + "delete_role";
//   //Skills
//   public Skills = this.baseUrl + this.websitePrefix + "fetch_skills";
//   public AddSkills = this.baseUrl + this.websitePrefix + "store_skills";
//   public EditSkills = this.baseUrl + this.websitePrefix + "update_skills";
//   public ShowSkills = this.baseUrl + this.websitePrefix + "show_skills";
//   public DeleteSkills = this.baseUrl + this.websitePrefix + "delete_skills";
//   public AddProjectAttachmentsDashboard =
//     this.baseUrl + this.websitePrefix + "add_attachment_to_offer";
//   public FetchUniquePermitInGeneralDataDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_unique_permit_in_general_data";
//   public AddOtherProjectAttachmentsDashboard =
//     this.baseUrl + this.websitePrefix + "store_attachment_for_other_project";
//   public FetchEmployeePlanned =
//     this.baseUrl + this.websitePrefix + "fetch_employee_planned";
//   //Job
//   public Job = this.baseUrl + this.websitePrefix + "fetch_web_jobs";
//   public AddJob = this.baseUrl + this.websitePrefix + "store_web_jobs";
//   public EditJob = this.baseUrl + this.websitePrefix + "update_web_jobs";
//   public ShowJob = this.baseUrl + this.websitePrefix + "show_web_jobs";
//   public DeleteJob = this.baseUrl + this.websitePrefix + "delete_web_jobs";
//   //Job
//   public Header = this.baseUrl + this.websitePrefix + "fetch_header";
//   public AddHeader = this.baseUrl + this.websitePrefix + "store_header";
//   public EditHeader = this.baseUrl + this.websitePrefix + "update_header";
//   public ShowHeader = this.baseUrl + this.websitePrefix + "show_header";
//   public DeleteHeader = this.baseUrl + this.websitePrefix + "delete_header";
//   //About
//   public AddAboutUs = this.baseUrl + this.websitePrefix + "updateOrCreateAbout";
//   public ShowAboutUs = this.baseUrl + this.websitePrefix + "show_about_us";
//   // Terms
//   public AddTerms = this.baseUrl + this.websitePrefix + "updateOrCreateTerm";
//   public ShowTerms = this.baseUrl + this.websitePrefix + "show_term";
//   // privacy
//   public AddPrivacy =
//     this.baseUrl + this.websitePrefix + "updateOrCreatePrivacy";
//   public ShowPrivacy = this.baseUrl + this.websitePrefix + "show_privacy";
//   // Password
//   public AddPassword = this.baseUrl + this.websitePrefix + "set_local_password";
//   public ShowPassword = this.baseUrl + this.websitePrefix + "show_password";
//   //contact
//   public Contact = this.baseUrl + this.websitePrefix + "fetch_contact_us";
//   //web branches
//   public WebBranches = this.baseUrl + this.websitePrefix + "fetch_web_branch";
//   public AddWebBranches =
//     this.baseUrl + this.websitePrefix + "store_web_branch";
//   public EditWebBranches =
//     this.baseUrl + this.websitePrefix + "update_web_branch";
//   public ShowWebBranches =
//     this.baseUrl + this.websitePrefix + "show_web_branch";
//   public DeleteWebBranches =
//     this.baseUrl + this.websitePrefix + "delete_web_branch";
//   //Client
//   public ClientCategory =
//     this.baseUrl + this.websitePrefix + "fetch_client_categories";
//   public AddClientCategory =
//     this.baseUrl + this.websitePrefix + "store_client_categories";
//   public EditClientCategory =
//     this.baseUrl + this.websitePrefix + "update_client_category";
//   public ShowClientCategory =
//     this.baseUrl + this.websitePrefix + "show_client_category";
//   public DeleteClientCategory =
//     this.baseUrl + this.websitePrefix + "delete_client_category";
//   //permits
//   public Permit = this.baseUrl + this.websitePrefix + "fetch_permits";
//   public AddPermit = this.baseUrl + this.websitePrefix + "store_permits";
//   public EditPermit = this.baseUrl + this.websitePrefix + "update_permit";
//   public ShowPermit = this.baseUrl + this.websitePrefix + "show_permit";
//   public DeletePermit = this.baseUrl + this.websitePrefix + "delete_permit";
//   public AddPermitLicenseStage =
//     this.baseUrl + this.websitePrefix + "store_permit_license_stage";
//   public FetchPermitLicenseStage =
//     this.baseUrl + this.websitePrefix + "fetch_permit_license_stage";

//   //store_authorty
//   public Authorty = this.baseUrl + this.websitePrefix + "fetch_authorty";
//   public AddAuthorty = this.baseUrl + this.websitePrefix + "store_authorty";
//   public EditAuthorty = this.baseUrl + this.websitePrefix + "update_authorty";
//   public ShowAuthorty = this.baseUrl + this.websitePrefix + "show_authorty";
//   public DeleteAuthorty = this.baseUrl + this.websitePrefix + "delete_authorty";
//   //project_type
//   public ProjectType = this.baseUrl + this.websitePrefix + "fetch_project_type";
//   public AddProjectType =
//     this.baseUrl + this.websitePrefix + "store_project_type";
//   public EditProjectType =
//     this.baseUrl + this.websitePrefix + "update_project_type";
//   public ShowProjectType =
//     this.baseUrl + this.websitePrefix + "show_project_type";
//   public DeleteProjectType =
//     this.baseUrl + this.websitePrefix + "delete_project_type";
//   // condition
//   public Condition = this.baseUrl + this.websitePrefix + "fetch_condition";
//   public AddCondition = this.baseUrl + this.websitePrefix + "store_condition";
//   public EditCondition = this.baseUrl + this.websitePrefix + "update_condition";
//   public ShowCondition = this.baseUrl + this.websitePrefix + "show_condition";
//   public DeleteCondition =
//     this.baseUrl + this.websitePrefix + "delete_condition";
//   //department
//   public Department = this.baseUrl + this.websitePrefix + "fetch_department";
//   public AddDepartment = this.baseUrl + this.websitePrefix + "store_department";
//   public EditDepartment =
//     this.baseUrl + this.websitePrefix + "update_department";
//   // client_category
//   public ShowDepartment = this.baseUrl + this.websitePrefix + "show_department";
//   public DeleteDepartment =
//     this.baseUrl + this.websitePrefix + "delete_department";
//   public ProjectDepartment =
//     this.baseUrl +
//     this.websitePrefix +
//     "get_project_department_upon_project_and_type";
//   public FetchAllInvoices =
//     this.baseUrl + this.websitePrefix + "fetch_all_invoices";

//   public NewInvoices = this.baseUrl + this.websitePrefix + "get_new_projects";
//   public ExportInvoices =
//     this.baseUrl + this.websitePrefix + "get_exported_invoices";
//   public PaidInvoices = this.baseUrl + this.websitePrefix + "get_paid_invoices";
//   public ReportAllInvoices =
//     this.baseUrl + this.websitePrefix + "fetch_invoice_reports";
//   // ClientStatisfaction
//   public ClientStatisfaction =
//     this.baseUrl + this.websitePrefix + "fetch_satisfactions";
//   public AddClientStatisfaction =
//     this.baseUrl + this.websitePrefix + "store_satisfactions";
//   public EditClientStatisfaction =
//     this.baseUrl + this.websitePrefix + "update_satisfaction";
//   public ShowClientStatisfaction =
//     this.baseUrl + this.websitePrefix + "show_satisfaction";
//   public DeleteClientStatisfaction =
//     this.baseUrl + this.websitePrefix + "delete_satisfaction";
//   // Prepare
//   public Prepare = this.baseUrl + this.websitePrefix + "fetch_prepares";
//   public AddPrepare = this.baseUrl + this.websitePrefix + "store_prepares";
//   public EditPrepare = this.baseUrl + this.websitePrefix + "update_prepares";
//   public ShowPrepare = this.baseUrl + this.websitePrefix + "show_prepare";
//   public DeletePrepare = this.baseUrl + this.websitePrefix + "delete_prepare";
//   // JobType
//   public JobType = this.baseUrl + this.websitePrefix + "fetch_job_types";
//   public AddJobType = this.baseUrl + this.websitePrefix + "store_job_types";
//   public EditJobType = this.baseUrl + this.websitePrefix + "update_job_types";
//   public ShowJobType = this.baseUrl + this.websitePrefix + "show_job_type";
//   public DeleteJobType = this.baseUrl + this.websitePrefix + "delete_job_type";
//   // AcademicDegree
//   public AcademicDegree = this.baseUrl + this.websitePrefix + "fetch_academic";
//   public AddAcademicDegree =
//     this.baseUrl + this.websitePrefix + "store_academic";
//   public EditAcademicDegree =
//     this.baseUrl + this.websitePrefix + "update_academic";
//   public ShowAcademicDegree =
//     this.baseUrl + this.websitePrefix + "show_academic";
//   public DeleteAcademicDegree =
//     this.baseUrl + this.websitePrefix + "delete_academic";
//   // Governorate
//   public Governorate = this.baseUrl + this.websitePrefix + "fetch_governorate";
//   public AddGovernorate =
//     this.baseUrl + this.websitePrefix + "store_governorate";
//   public EditGovernorate =
//     this.baseUrl + this.websitePrefix + "update_governorate";
//   public ShowGovernorate =
//     this.baseUrl + this.websitePrefix + "show_governorate";
//   public DeleteGovernorate =
//     this.baseUrl + this.websitePrefix + "delete_governorate";
//   //clients
//   public Clients = this.baseUrl + this.websitePrefix + "fetch_clients";
//   public AddClient = this.baseUrl + this.websitePrefix + "store_clients";
//   public EditClient = this.baseUrl + this.websitePrefix + "update_client";
//   public ShowClient = this.baseUrl + this.websitePrefix + "show_client";
//   public AcceptClient =
//     this.baseUrl + this.websitePrefix + "change_client_status";
//   public DeleteClient = this.baseUrl + this.websitePrefix + "delete_client";
//   public ClientProject =
//     this.baseUrl + this.websitePrefix + "show_client_projects";
//   // city
//   public City = this.baseUrl + this.websitePrefix + "fetch_city";
//   public AddCity = this.baseUrl + this.websitePrefix + "store_city";
//   public EditCity = this.baseUrl + this.websitePrefix + "update_city";
//   public ShowCity = this.baseUrl + this.websitePrefix + "show_city";
//   public DeleteCity = this.baseUrl + this.websitePrefix + "delete_city";
//   // region
//   public Region = this.baseUrl + this.websitePrefix + "fetch_region";
//   public AddRegion = this.baseUrl + this.websitePrefix + "store_region";
//   public EditRegion = this.baseUrl + this.websitePrefix + "update_region";
//   public ShowRegion = this.baseUrl + this.websitePrefix + "show_region";
//   public DeleteRegion = this.baseUrl + this.websitePrefix + "delete_region";
//   // place
//   public Place = this.baseUrl + this.websitePrefix + "fetch_place";
//   public AddPlace = this.baseUrl + this.websitePrefix + "store_place";
//   public EditPlace = this.baseUrl + this.websitePrefix + "update_place";
//   public ShowPlace = this.baseUrl + this.websitePrefix + "show_place";
//   public DeletePlace = this.baseUrl + this.websitePrefix + "delete_place";
//   // introduce methods
//   public IntroduceMethods =
//     this.baseUrl + this.websitePrefix + "fetch_introduce_methods";
//   public AddIntroduceMethods =
//     this.baseUrl + this.websitePrefix + "store_introduce_methods";
//   public EditIntroduceMethods =
//     this.baseUrl + this.websitePrefix + "update_introduce_method";
//   public ShowIntroduceMethods =
//     this.baseUrl + this.websitePrefix + "show_introduce_method";
//   public DeleteIntroduceMethods =
//     this.baseUrl + this.websitePrefix + "delete_introduce_method";
//   //employee
//   public Employee = this.baseUrl + this.websitePrefix + "fetch_employee";
//   public AddEmployee = this.baseUrl + this.websitePrefix + "store_employee";
//   public EditEmployee = this.baseUrl + this.websitePrefix + "update_employee";
//   public ShowEmployee = this.baseUrl + this.websitePrefix + "show_employee";
//   public ChangePasswordEmployee =
//     this.baseUrl + this.websitePrefix + "change_employee_password";
//   public DeleteEmployee = this.baseUrl + this.websitePrefix + "delete_employee";
//   // reason
//   public Reason = this.baseUrl + this.websitePrefix + "fetch_reason";
//   public AddReason = this.baseUrl + this.websitePrefix + "store_reason";
//   public EditReason = this.baseUrl + this.websitePrefix + "update_reason";
//   public ShowReason = this.baseUrl + this.websitePrefix + "show_reason";
//   public DeleteReason = this.baseUrl + this.websitePrefix + "delete_reason";
//   // ToolType
//   public ToolType = this.baseUrl + this.websitePrefix + "fetch_tool_types";
//   public AddToolType = this.baseUrl + this.websitePrefix + "store_tool_type";
//   public EditToolType = this.baseUrl + this.websitePrefix + "update_tool_type";
//   public ShowToolType = this.baseUrl + this.websitePrefix + "show_tool_type";
//   public DeleteToolType =
//     this.baseUrl + this.websitePrefix + "delete_tool_type";
//   // interview_type
//   public InterviewType =
//     this.baseUrl + this.websitePrefix + "fetch_interview_type";
//   public AddInterviewType =
//     this.baseUrl + this.websitePrefix + "store_interview_type";
//   public EditInterviewType =
//     this.baseUrl + this.websitePrefix + "update_interview_type";
//   public ShowInterviewType =
//     this.baseUrl + this.websitePrefix + "show_interview_type";
//   public DeleteInterviewType =
//     this.baseUrl + this.websitePrefix + "delete_interview_type";
//   //supervision_types
//   public AddSupervisionTypeScope =
//     this.baseUrl + this.websitePrefix + "store_supervision_types";
//   public ShowSupervisionTypeScope =
//     this.baseUrl + this.websitePrefix + "show_supervision_type";
//   public EditSupervisionTypeScope =
//     this.baseUrl + this.websitePrefix + "update_supervision_type";
//   public DeleteSupervisionTypeScope =
//     this.baseUrl + this.websitePrefix + "delete_supervision_type";
//   public SupervisionTypeScopes =
//     this.baseUrl + this.websitePrefix + "fetch_supervision_types";
//   //scope
//   public WorkScope = this.baseUrl + this.websitePrefix + "fetch_work_scopes";
//   public AddWorkScope = this.baseUrl + this.websitePrefix + "store_work_scopes";
//   public EditWorkScope =
//     this.baseUrl + this.websitePrefix + "update_work_scope";
//   public ShowWorkScope = this.baseUrl + this.websitePrefix + "show_work_scope";
//   public DeleteWorkScope =
//     this.baseUrl + this.websitePrefix + "delete_work_scope";
//   //PermanentType
//   public PermanentType =
//     this.baseUrl + this.websitePrefix + "fetch_permanent_types";
//   public AddPermanentType =
//     this.baseUrl + this.websitePrefix + "store_permanent_types";
//   public EditPermanentType =
//     this.baseUrl + this.websitePrefix + "update_permanent_type";
//   public ShowPermanentType =
//     this.baseUrl + this.websitePrefix + "show_permanent_type";
//   public DeletePermanentType =
//     this.baseUrl + this.websitePrefix + "delete_permanent_type";
//   //hierarchy
//   public Herikalies = this.baseUrl + this.websitePrefix + "fetch_herikalies";
//   public AddHierarchy = this.baseUrl + this.websitePrefix + "store_herikalies";
//   public EditHierarchy = this.baseUrl + this.websitePrefix + "update_herikaly";
//   public ShowHierarchy = this.baseUrl + this.websitePrefix + "show_herikaly";
//   public DeleteHierarchy =
//     this.baseUrl + this.websitePrefix + "delete_herikaly";
//   //tender
//   public Tender = this.baseUrl + this.websitePrefix + "fetch_tender_types";
//   public AddTender = this.baseUrl + this.websitePrefix + "store_tender_type";
//   public EditTender = this.baseUrl + this.websitePrefix + "update_tender_types";
//   public ShowTender = this.baseUrl + this.websitePrefix + "show_tender_type";
//   public DeleteTender =
//     this.baseUrl + this.websitePrefix + "delete_tender_type";
//   //store_invoices
//   public AddInvoice = this.baseUrl + this.websitePrefix + "store_invoices";
//   public AddSupervisionInvoice =
//     this.baseUrl + this.websitePrefix + "store_invoice_department_cost";
//   public EditInvoice =
//     this.baseUrl + this.websitePrefix + "update_plan_invoice";

//   public UpdateProjectTotalPriceInvoices =
//     this.baseUrl + this.websitePrefix + "update_project_total_price_invoices";

//   public FetchInvoice = this.baseUrl + this.websitePrefix + "fetch_invoices";
//   public FetchGroupInvoices =
//     this.baseUrl + this.websitePrefix + "fetch_group_invoices";
//   public FetchInvoiceHistory =
//     this.baseUrl + this.websitePrefix + "fetch_history_invoices";
//   public FetchInvoiceHistoryReport =
//     this.baseUrl + this.websitePrefix + "fetch_invoice_history_report";
//   public ExportInvoice =
//     this.baseUrl + this.websitePrefix + "activeExportInvoice";
//   public PaymentInvoice =
//     this.baseUrl + this.websitePrefix + "store_history_invoices";
//   public FetchExtraInvoice =
//     this.baseUrl + this.websitePrefix + "fetch_extra_plan";
//   public PaymentExtraInvoice =
//     this.baseUrl + this.websitePrefix + "pay_invoice_supervision";
//   public AddDiscountInvoice =
//     this.baseUrl + this.websitePrefix + "discount_invoice";

//   public AddNewSupervisionGroup =
//     this.baseUrl + this.websitePrefix + "store_supervision_group_invoices";

//   public FetchNewSupervisionGroup =
//     this.baseUrl + this.websitePrefix + "fetch_supervision_group_invoices";

//   public DeletePlan = this.baseUrl + this.websitePrefix + "delete_plan";
//   public ShowPlan = this.baseUrl + this.websitePrefix + "show_plan_invoice";
//   public FetchProjectInvoice =
//     this.baseUrl + this.websitePrefix + "show_project_invoices";
//   public FetchInvoicePdf =
//     this.baseUrl + this.websitePrefix + "custom_show_invoice";
//   public ShowInvoiceSupervision =
//     this.baseUrl + this.websitePrefix + "show_invoice_supervision";
//   public GroupInvoices =
//     this.baseUrl + this.websitePrefix + "store_group_invoice";
//   public ProjectInvoices =
//     this.baseUrl + this.websitePrefix + "fetch_plan_invoices";
//   //store_bank
//   public AddBankAccount = this.baseUrl + this.websitePrefix + "store_bank";
//   public FetchBankAccount = this.baseUrl + this.websitePrefix + "fetch_banks";
//   public EditBankAccount = this.baseUrl + this.websitePrefix + "update_bank";
//   public ShowBankAccount = this.baseUrl + this.websitePrefix + "show_bank";
//   public DeleteBankAccount = this.baseUrl + this.websitePrefix + "delete_bank";
//   //Holiday
//   public Holiday = this.baseUrl + this.websitePrefix + "fetch_holiday";
//   public AddHoliday = this.baseUrl + this.websitePrefix + "store_holiday";
//   public EditHoliday = this.baseUrl + this.websitePrefix + "update_holiday";
//   public ShowHoliday = this.baseUrl + this.websitePrefix + "show_holiday";
//   public DeleteHoliday = this.baseUrl + this.websitePrefix + "delete_holiday";
//   //imprest
//   public Imprest = this.baseUrl + this.websitePrefix + "fetch_imprest";
//   public AddImprest = this.baseUrl + this.websitePrefix + "store_imprest";
//   public EditImprest = this.baseUrl + this.websitePrefix + "update_imprest";
//   public ShowImprest = this.baseUrl + this.websitePrefix + "show_imprest";
//   public DeleteImprest = this.baseUrl + this.websitePrefix + "delete_imprest";
//   //discount
//   public Discount = this.baseUrl + this.websitePrefix + "fetch_incentive";
//   public AddDiscount = this.baseUrl + this.websitePrefix + "store_incentive";
//   public EditDiscount = this.baseUrl + this.websitePrefix + "update_incentive";
//   public ShowDiscount = this.baseUrl + this.websitePrefix + "show_incentive";
//   public DeleteDiscount =
//     this.baseUrl + this.websitePrefix + "delete_incentive";
//   //Bonus
//   public Bonus = this.baseUrl + this.websitePrefix + "fetch_incentive";
//   public AddBonus = this.baseUrl + this.websitePrefix + "store_incentive";
//   public EditBonus = this.baseUrl + this.websitePrefix + "update_incentive";
//   public ShowBonus = this.baseUrl + this.websitePrefix + "show_incentive";
//   public DeleteBonus = this.baseUrl + this.websitePrefix + "delete_incentive";
//   public GetEmployeeStatics =
//     this.baseUrl + this.websitePrefix + "fetch_employee_hr_statistics";
//   public FetchEmployeeEntitlements =
//     this.baseUrl + this.websitePrefix + "fetch_employees_hr_statistics";
//   //discount
//   public AddProjectDiscountDashboard =
//     this.baseUrl + this.websitePrefix + "discount_offer";

//   public AddClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "store_client_request";
//   public EditClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "update_client_request";
//   public ShowClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "show_client_request";
//   public IndexClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_client_request";
//   public DeleteClientRequestDashboard =
//     this.baseUrl + this.websitePrefix + "delete_client_request_offer";
//   public ConvertToOffer =
//     this.baseUrl + this.websitePrefix + "convert_to_offer";
//   public RejectClientRequest =
//     this.baseUrl + this.websitePrefix + "client_request_rejected_status";
//   public DeleteClientRequest =
//     this.baseUrl + this.websitePrefix + "delete_client_request";
//   public AddNewPreviewDashboard =
//     this.baseUrl + this.websitePrefix + "preview_client_request";
//   public AddProjectPreviewDashboard =
//     this.baseUrl + this.websitePrefix + "add_project_meeting";
//   public AddResultPreviewDashboard =
//     this.baseUrl + this.websitePrefix + "store_preview_result";
//   public AddContent = this.baseUrl + this.websitePrefix + "store_floor_content";
//   public EditContent =
//     this.baseUrl + this.websitePrefix + "update_floor_content";
//   public ShowContent = this.baseUrl + this.websitePrefix + "show_floor_content";
//   public fetchContent =
//     this.baseUrl + this.websitePrefix + "fetch_floor_content";
//   public DeletContent =
//     this.baseUrl + this.websitePrefix + "delete_floor_content";
//   public AddRequirements = this.baseUrl + this.websitePrefix + "add";
//   public FetchRequirements = this.baseUrl + this.websitePrefix + "fetch";
//   public EditRequirements = this.baseUrl + this.websitePrefix + "edit";
//   public ShowRequirements = this.baseUrl + this.websitePrefix + "show";
//   public DeletRequirements = this.baseUrl + this.websitePrefix + "del";
//   public AddNewProjectPreviewDashboard =
//     this.baseUrl + this.websitePrefix + "preview_project";
//   public AddPermissionEmployee =
//     this.baseUrl + this.websitePrefix + "store_employee_permissions";

//   public SetEmployeesPlanner =
//     this.baseUrl + this.websitePrefix + "set_employees_planner";

//   public SetEmployeesDCPlanner =
//     this.baseUrl + this.websitePrefix + "set_employees_dc_planner";

//   public ShowPreviewDashboard =
//     this.baseUrl + this.websitePrefix + "show_preview";
//   public ShowEmployeePermission =
//     this.baseUrl + this.websitePrefix + "fetch_employee_permissions";
//   public IndexMeetingResultDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_meeting_results";
//   public ChangeMeetingStatus =
//     this.baseUrl + this.websitePrefix + "change_status_result";
//   public DeleteGroupInvoice =
//     this.baseUrl + this.websitePrefix + "delete_group_invoice";
//   public AddLicensesStagesRequirements =
//     this.baseUrl + this.websitePrefix + "store_licenses_requirement";
//   public ShowLicensesStageRequirements =
//     this.baseUrl + this.websitePrefix + "show";
//   public EditLicensesStageRequirements =
//     this.baseUrl + this.websitePrefix + "edit";
//   public LicensesStageRequirementsIndex =
//     this.baseUrl + this.websitePrefix + "fetch";
//   public DeleteLicensesStageRequirements =
//     this.baseUrl + this.websitePrefix + "delete";
//   //stages
//   public Stages = this.baseUrl + this.websitePrefix + "fetch_stage";
//   public AddStage = this.baseUrl + this.websitePrefix + "store_stage";
//   public EditStage = this.baseUrl + this.websitePrefix + "update_stage";

//   // this.baseUrl + this.websitePrefix + "delete_group_invoice";
//   public ShowStage = this.baseUrl + this.websitePrefix + "show_stage";
//   public DeleteStage = this.baseUrl + this.websitePrefix + "delete_stage";
//   // delete attachments
//   public DeleteAttachmentDashboard =
//     this.baseUrl + this.websitePrefix + "delete_attachment";
//   public RemoveAttachmentDashboard =
//     this.baseUrl + this.websitePrefix + "remove_attachment_from_basic_data";
//   public RemoveAttachmentFromBasicDataDashboard =
//     this.baseUrl +
//     this.websitePrefix +
//     "delete_attachment_from_specific_basic_data";
//   public AddAbsence = this.baseUrl + this.websitePrefix + "store_attendance";
//   public AbsenceTodayApiService =
//     this.baseUrl + this.websitePrefix + "attendance_checkout";

//   public FetchAbsence = this.baseUrl + this.websitePrefix + "fetch_attendances";

//   public AddLicenseTypeStudyDashboard =
//     this.baseUrl + this.websitePrefix + "set_licenses_in_project";

//   public ChangeIsNewInProject =
//     this.baseUrl + this.websitePrefix + "change_is_new_in_project";

//   //daily work
//   public AssignTaskForEngineer =
//     this.baseUrl + this.websitePrefix + "assign_task_for_engineer";
//   public AddSprintPermitNote =
//     this.baseUrl + this.websitePrefix + "store_sprint_permit_notes";

//   public ResetPlan = this.baseUrl + this.websitePrefix + "reset_plan";
//   public DeleteProjectInvoice =
//     this.baseUrl + this.websitePrefix + "new_reset_invoices";

//   public ResetProjectPlan =
//     this.baseUrl + this.websitePrefix + "reset_plan_project";

//   public FetchPermitDetailsTask =
//     this.baseUrl + this.websitePrefix + "fetch_permit_details";
//   public FetchEffectedPermits =
//     this.baseUrl + this.websitePrefix + "fetch_hold_system_permit";
//   public AssginEmployeesToProject =
//     this.baseUrl + this.websitePrefix + "assign_employees_to_project";
//   public FetchAssingnedEmployeesDepartment =
//     this.baseUrl + this.websitePrefix + "fetch_departments_assigned_employees";

//   public CreateDailyWork =
//     this.baseUrl + this.websitePrefix + "store_daily_work";

//   public FinishDailyWork =
//     this.baseUrl + this.websitePrefix + "finish_daily_work";

//   public FetchDailyWork =
//     this.baseUrl + this.websitePrefix + "fetch_assigned_permit";
//   public FetchAllRejectedPlans =
//     this.baseUrl + this.websitePrefix + "fetch_all_rejected_plans";
//   public FetchDailyWorkStatics =
//     this.baseUrl + this.websitePrefix + "fetch_permits_report";
//   public FetchDailyWorkProject =
//     this.baseUrl + this.websitePrefix + "fetch_permit_by_project";

//   public FetchDailyHoldWork =
//     this.baseUrl + this.websitePrefix + "fetch_daily_hold";

//   public FetchSentToClient =
//     this.baseUrl + this.websitePrefix + "fetch_sent_to_client";

//   public FetchFinishedPermits =
//     this.baseUrl + this.websitePrefix + "fetch_finished_permits";

//   public SentToClient =
//     this.baseUrl + this.websitePrefix + "change_inside_status";

//   public RejectToClient =
//     this.baseUrl + this.websitePrefix + "reject_to_client";

//   public RejectPlanFromRequestAssign =
//     this.baseUrl + this.websitePrefix + "reject_plan_from_request_assign";

//   public AcceptToClient =
//     this.baseUrl + this.websitePrefix + "accept_to_client";
//   public Checkout = this.baseUrl + this.websitePrefix + "checkout_system";
//   public Checkin = this.baseUrl + this.websitePrefix + "checkin_system";
//   public FetchSmartProjectTrackingReport =
//     this.baseUrl + this.websitePrefix + "fetch_smart_project_statics_report";

//   public FetchSmartProjectTrackingPermitsReport =
//     this.baseUrl + this.websitePrefix + "fetch_smart_project_tracking_report";
//   public StoreGeneralTask =
//     this.baseUrl + this.websitePrefix + "store_general_task";
//   public FetchGeneralTask =
//     this.baseUrl + this.websitePrefix + "fetch_general_tasks";
//   public UpdateGeneralTask =
//     this.baseUrl + this.websitePrefix + "update_general_task";

//   public DeleteTask =
//     this.baseUrl + this.websitePrefix + "reset_sprint_permit_data";

//   public UploadSprintFile =
//     this.baseUrl + this.websitePrefix + "upload_task_attachments";

//   public DeleteGeneralTask =
//     this.baseUrl + this.websitePrefix + "delete_general_task";
//   public ShowGeneralTask =
//     this.baseUrl + this.websitePrefix + "show_general_task";

//   public HoldOperationPermit =
//     this.baseUrl + this.websitePrefix + "hold_operation_permit";

//   public HoldDailyWork = this.baseUrl + this.websitePrefix + "hold_daily_work";

//   public changestudystatus =
//     this.baseUrl + this.websitePrefix + "update_project_study_status";

//   public FinishStudyRow =
//     this.baseUrl + this.websitePrefix + "finish_study_row";

//   public ReadyToMissingExport =
//     this.baseUrl + this.websitePrefix + "ready_to_missing_export";

//   public ExportProjectMissing =
//     this.baseUrl + this.websitePrefix + "new_export_project_missing";

//   public ShowAssingnedEmployeesDepartment =
//     this.baseUrl +
//     this.websitePrefix +
//     "fetch_assigned_employees_upon_department";

//   public ShowMissingProjectPdf =
//     this.baseUrl + this.websitePrefix + "project_pdf_missing";

//   public RevisedProjectMissing =
//     this.baseUrl + this.websitePrefix + "revise_export_missing";

//   public fetchStudyHistory =
//     this.baseUrl + this.websitePrefix + "fetch_project_study_history";

//   public ResetProject =
//     this.baseUrl + this.websitePrefix + "remove_related_project";

//   public AddAttachmentToBasicData =
//     this.baseUrl + this.websitePrefix + "upload_basic_licenses";

//   public UpdateTemplate =
//     this.baseUrl + this.websitePrefix + "upload_general_data_licenses_file";

//   public UpdateProjectBasicData =
//     this.baseUrl + this.websitePrefix + "update_project_basic_date";

//   public FinishProject = this.baseUrl + this.websitePrefix + "finished_project";
//   public PlanProject = this.baseUrl + this.websitePrefix + "planed_project";
//   public ResetProjectInvoice =
//     this.baseUrl + this.websitePrefix + "reset_invoices";

//   public FetchProjectInvoiceHistory =
//     this.baseUrl + this.websitePrefix + "fetch_project_invoices_history";

//   public FetchProjectPaymentHistory =
//     this.baseUrl + this.websitePrefix + "fetch_project_payment_history";

//   public FetchAmountStatistics =
//     this.baseUrl + this.websitePrefix + "getOfferStatisticByMonth_2";
//   public FetchEmployeeStatistics =
//     this.baseUrl + this.websitePrefix + "fetch_employee_offer_statistic";
//   public FetchProjectsStatistics =
//     this.baseUrl + this.websitePrefix + "getOfferStatisticByMonth";

//   public ConfigurationAlarm =
//     this.baseUrl + this.websitePrefix + "configuration_alarm";

//   public SystemBugs = this.baseUrl + this.websitePrefix + "bug_offers_reports";

//   public indexOffer = this.baseUrl + this.websitePrefix + "fetch_offer";

//   public AddRemainder =
//     this.baseUrl + this.websitePrefix + "store_reminder_notification";
//   public EditRemainder =
//     this.baseUrl + this.websitePrefix + "update_reminder_notification";
//   public ShowRemainder =
//     this.baseUrl + this.websitePrefix + "show_reminder_notification";
//   public IndexRemainder =
//     this.baseUrl + this.websitePrefix + "fetch_reminder_notifications";
//   public DeleteRemainder =
//     this.baseUrl + this.websitePrefix + "delete_reminder_notification";
//   public ShowReminderHistory =
//     this.baseUrl + this.websitePrefix + "reminder_notification_history";

//   public FetchRemainderNotifactions =
//     this.baseUrl + this.websitePrefix + "fetch_send_reminder_notifications";
//   public SentRemainder =
//     this.baseUrl + this.websitePrefix + "store_send_reminder_notification";
//   public ClickRemainder =
//     this.baseUrl + this.websitePrefix + "click_reminder_notification";
//   public ClientReport =
//     this.baseUrl + this.websitePrefix + "general_report_requirement";

//   public WaitingDocumentRequirement =
//     this.baseUrl + this.websitePrefix + "fetch_waiting_document_requirements";

//   // reminder_category
//   public IndexReminderCategory =
//     this.baseUrl + this.websitePrefix + "fetch_reminder_category";
//   public AddReminderCategory =
//     this.baseUrl + this.websitePrefix + "store_reminder_category";
//   public EditReminderCategory =
//     this.baseUrl + this.websitePrefix + "update_reminder_category";
//   public DeleteReminderCategory =
//     this.baseUrl + this.websitePrefix + "delete_reminder_category";
//   public ShowReminderCategory =
//     this.baseUrl + this.websitePrefix + "show_reminder_category";
//   public ProjectSelect =
//     this.baseUrl + this.websitePrefix + "fetch_project_study_status";

//   public GenerateHeyzineAttachmentDashboard =
//     this.baseUrl + this.websitePrefix + "flip_book_heyzine";

//   public SendAttention =
//     this.baseUrl +
//     this.websitePrefix +
//     "send_whatsapp_message_to_attention_offer";

//   public ChatGuide = this.baseUrl + this.websitePrefix + "guide_chat";
//   public FetchAttendenceReport =
//     this.baseUrl + this.websitePrefix + "attendance_report";

//   // Offical Holidays
//   public AddOfficalHolidays =
//     this.baseUrl + this.websitePrefix + "store_general_holiday";
//   public EditOfficalHolidays =
//     this.baseUrl + this.websitePrefix + "update_general_holiday";
//   public IndexOfficalHolidays =
//     this.baseUrl + this.websitePrefix + "fetch_general_holiday";
//   public DeleteOfficalHolidays =
//     this.baseUrl + this.websitePrefix + "delete_general_holiday";
//   public ShowOfficalHolidays =
//     this.baseUrl + this.websitePrefix + "show_general_holiday";

//   // Weekly Holidays
//   public AddWeeklyholidays =
//     this.baseUrl + this.websitePrefix + "store_weekly_holiday";
//   public IndexWeeklyholidays =
//     this.baseUrl + this.websitePrefix + "fetch_weekly_holidays";

//   // Currency
//   public AddCurrency = this.baseUrl + this.websitePrefix + "store_currency";
//   public EditCurrency = this.baseUrl + this.websitePrefix + "update_currency";
//   public IndexCurrency = this.baseUrl + this.websitePrefix + "fetch_currencies";
//   public DeleteCurrency = this.baseUrl + this.websitePrefix + "delete_currency";
//   public ShowCurrency = this.baseUrl + this.websitePrefix + "show_currency";

//   // Manual Attendence
//   public AddManualAttendence =
//     this.baseUrl + this.websitePrefix + "store_employee_attendance";
//   public EditManualAttendence =
//     this.baseUrl + this.websitePrefix + "update_employee_attendance";
//   public IndexManualAttendence =
//     this.baseUrl + this.websitePrefix + "fetch_employee_attendance";
//   public DeleteManualAttendence =
//     this.baseUrl + this.websitePrefix + "delete_employee_attendance";
//   public ShowManualAttendence =
//     this.baseUrl + this.websitePrefix + "show_employee_attendance";

//   //plan
//   FetchPlanPermitDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_ready_to_plan_permits";
//   FetchPlanedPermitDashboard =
//     this.baseUrl + this.websitePrefix + "fetch_planned_permits";
//   PlanPermitDashboard = this.baseUrl + this.websitePrefix + "plan_permit";

//   public FetchUploadedFile =
//     this.baseUrl + this.websitePrefix + "fetch_attendance_files";
//   public DeleteUploadedFile =
//     this.baseUrl + this.websitePrefix + "delete_attendance_file";

//   public FetchProjectPlanDepartment =
//     this.baseUrl + this.websitePrefix + "fetch_departments_upon_project";
//   public FetchPostpoundedPermits =
//     this.baseUrl + this.websitePrefix + "fetch_post_pounded_permits";
//   public ActiveProjectDepartmentPlanDashboard =
//     this.baseUrl + this.websitePrefix + "active_departments_upon_project";

//   // Sprint
//   public StoreSprint = this.baseUrl + this.websitePrefix + "store_sprint";
//   public IndexSprint = this.baseUrl + this.websitePrefix + "fetch_sprints";
//   public EditSprint = this.baseUrl + this.websitePrefix + "update_sprint";
//   public ShowSprint = this.baseUrl + this.websitePrefix + "show_sprint";
//   public DeleteSprint = this.baseUrl + this.websitePrefix + "delete_sprint";

//   public DetectPlanAccuracy =
//     "https://aiplan.orbitconsults.com/api/detectPlanAccuracy";
//   public SprintPermit =
//     this.baseUrl + this.websitePrefix + "store_sprint_permit";

//   public StoreSprintPermitAttachment =
//     this.baseUrl + this.websitePrefix + "store_sprint_permit_attachments";

//   public AddNotebad = this.baseUrl + this.websitePrefix + "store_employee_note";
//   public EditNotebad =
//     this.baseUrl + this.websitePrefix + "update_employee_note";
//   public DeleteNotebad =
//     this.baseUrl + this.websitePrefix + "delete_employee_note";
//   public IndexNotebad =
//     this.baseUrl + this.websitePrefix + "fetch_employee_notes";
//   public ShowNotebad = this.baseUrl + this.websitePrefix + "show_employee_note";

//   public AddFavoriteRoutes =
//     this.baseUrl + this.websitePrefix + "store_fast_route";
//   public EditFavoriteRoutes =
//     this.baseUrl + this.websitePrefix + "update_fast_route";
//   public DeleteFavoriteRoutes =
//     this.baseUrl + this.websitePrefix + "delete_fast_route";
//   public IndexFavoriteRoutes =
//     this.baseUrl + this.websitePrefix + "fetch_fast_routes";
//   public ShowFavoriteRoutes =
//     this.baseUrl + this.websitePrefix + "show_fast_route";

//   public AddDeclaration =
//     this.baseUrl + this.websitePrefix + "store_declaration";
//   public EditDeclaration =
//     this.baseUrl + this.websitePrefix + "update_declaration";
//   public DeleteDeclaration =
//     this.baseUrl + this.websitePrefix + "delete_declaration";
//   public IndexDeclaration =
//     this.baseUrl + this.websitePrefix + "fetch_declarations";
//   public ShowDeclaration =
//     this.baseUrl + this.websitePrefix + "show_declaration";
//   public StoreDeclaration =
//     this.baseUrl + this.websitePrefix + "store_employee_declaration";

//   public DailyWorkAction =
//     this.baseUrl + this.websitePrefix + "store_sprint_permit_employee_task";
//   public FetchOverduePermits =
//     this.baseUrl + this.websitePrefix + "fetch_overdue_permits";
//   public AddAuthorityTypeStudyDashboard =
//     this.baseUrl + this.websitePrefix + "set_authority_in_project";

//   public DisavtiveBasicData =
//     this.baseUrl + this.websitePrefix + "basic_data_toggle_active";

//   public ToggleGeneralTaskTestCase =
//     this.baseUrl + this.websitePrefix + "toggle_general_task_test_case";

//   //draft_task
//   public AddDraftTask =
//     this.baseUrl + this.websitePrefix + "store_drafting_general_tasks";
//   public EditDraftTask =
//     this.baseUrl + this.websitePrefix + "update_draft_task";
//   public DeleteDraftTask =
//     this.baseUrl + this.websitePrefix + "delete_draft_task";
//   public IndexDraftTask =
//     this.baseUrl + this.websitePrefix + "fetch_draft_tasks";
//   public ShowDraftTask = this.baseUrl + this.websitePrefix + "show_draft_task";

//   // Employee Email
//   public AddMail = this.baseUrl + this.websitePrefix + "store_employee_email";
//   public EditMail = this.baseUrl + this.websitePrefix + "update_employee_email";
//   public DeleteMail =
//     this.baseUrl + this.websitePrefix + "delete_employee_email";
//   public IndexMail =
//     this.baseUrl + this.websitePrefix + "fetch_employee_emails";
//   public ShowMail = this.baseUrl + this.websitePrefix + "show_employee_email";

//   private static _instance: ApiNames;

//   public static get instance(): ApiNames {
//     if (!this._instance) {
//       this._instance = new ApiNames();
//     }
//     return this._instance;
//   }
// }

// export { ApiNames };
